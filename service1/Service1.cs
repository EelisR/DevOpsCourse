using System.Net;
using System.Net.Http.Headers;
using System.Net.Sockets;
using System.Text;
using System.Text.Json;
using Constants;
using RabbitMQ.Client;

namespace Services
{
    public class Service1
    {
        private readonly string _ownPort;
        private readonly string _service2Addr;
        private readonly IModel _channel;
        private int _runningNumber = 0;

        private ServiceState? _state = null;

        public Service1(string service2Addr, string ownPort, IModel channel)
        {
            _service2Addr = service2Addr;
            _channel = channel;
            _ownPort = ownPort;
        }

        public ServiceState? SetState(ServiceState state)
        {
            if (_state != null && state == _state)
                return _state;

            switch (state)
            {
                case ServiceState.INIT:
                    _state = ServiceState.RUNNING;
                    _runningNumber = 0;
                    Sender();
                    break;
                case ServiceState.RUNNING:
                    Sender();
                    break;
                case ServiceState.PAUSED:
                    _state = ServiceState.PAUSED;
                    break;
                case ServiceState.SHUTDOWN:
                    _state = ServiceState.SHUTDOWN;
                    break;
            }

            return _state;
        }

        private static string GetTimeStamp() => DateTime.Now.ToUniversalTime().ToString("o");

        private static byte[] GetBytes(string str) => Encoding.UTF8.GetBytes(str);

        public async void Sender()
        {
            Console.WriteLine("Starting sender");
            using var client = new HttpClient();

            var dns = Dns.GetHostEntry(Dns.GetHostName());

            // Quite unintuitive
            var ip = dns.AddressList.FirstOrDefault(
                x => x.AddressFamily == AddressFamily.InterNetwork
            );

            while (true)
            {
                Thread.Sleep(2000);
                if (_state != ServiceState.RUNNING)
                    return;

                _runningNumber++;

                var message = $"SND {_runningNumber} {GetTimeStamp()} {_service2Addr}";

                _channel.BasicPublish(
                    exchange: MessageConstants.EXCHANGE_NAME,
                    body: GetBytes(message),
                    routingKey: MessageConstants.MESSAGE_QUEUE
                );

                var json = JsonSerializer.Serialize(
                    new ServerMessage { message = message, origin = $"{ip}:{_ownPort}" }
                );
                var jsonContent = new StringContent(
                    json,
                    Encoding.UTF8,
                    new MediaTypeHeaderValue("application/json")
                );

                try
                {
                    var res = await client.PostAsync($"http://{_service2Addr}", jsonContent);
                    _channel.BasicPublish(
                        exchange: MessageConstants.EXCHANGE_NAME,
                        body: GetBytes($"{(int)res.StatusCode} {GetTimeStamp()}"),
                        routingKey: MessageConstants.LOG_QUEUE
                    );
                }
                catch (Exception e)
                {
                    Console.WriteLine(e.Message);
                    _channel.BasicPublish(
                        exchange: MessageConstants.EXCHANGE_NAME,
                        body: GetBytes(e.Message),
                        routingKey: MessageConstants.LOG_QUEUE
                    );
                }
            }
        }
    }

    public enum ServiceState
    {
        INIT,
        RUNNING,
        PAUSED,
        SHUTDOWN
    }

    class ServerMessage
    {
        public string message { get; set; } = "";
        public string origin { get; set; } = "";
    }
}
