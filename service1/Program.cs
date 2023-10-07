using System.Diagnostics;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Sockets;
using System.Text;
using System.Text.Json;
using RabbitMQ.Client;


string SERVICE_2_ADDR = Environment.GetEnvironmentVariable("SERVICE_2_ADDRESS") ?? "localhost";
string SERVICE_2_PORT = Environment.GetEnvironmentVariable("SERVICE_2_PORT") ?? "8000";
string OWN_PORT = Environment.GetEnvironmentVariable("OWN_PORT") ?? "4001";

string MQ_ADDRESS = Environment.GetEnvironmentVariable("MQ_ADDRESS") ?? "localhost";
string MQ_PORT = Environment.GetEnvironmentVariable("MQ_PORT") ?? "5672";

const string EXCHANGE_NAME = "devops";
const string MESSAGE_QUEUE = "message";
const string LOG_QUEUE = "log";
const string STOP = "SND STOP";


Process.Start("./wait-for-it.sh", $"{MQ_ADDRESS}:{MQ_PORT}").WaitForExit();

var factory = new ConnectionFactory() { HostName = MQ_ADDRESS, Port = int.Parse(MQ_PORT) };

using var connection = factory.CreateConnection();
using var channel = connection.CreateModel();

channel.ExchangeDeclare("devops", ExchangeType.Topic, true);
channel.QueueDeclare("message", durable: true, exclusive: false, autoDelete: true);
channel.QueueDeclare("log", durable: true, exclusive: false, autoDelete: false);
channel.QueueBind("message", "devops", "message");
channel.QueueBind("log", "devops", "log");


using var client = new HttpClient();

var dns = Dns.GetHostEntry(Dns.GetHostName());

// Quite unintuitive
var ip = dns.AddressList.FirstOrDefault(x => x.AddressFamily == AddressFamily.InterNetwork);

string GetTimeStamp() => DateTime.Now.ToUniversalTime().ToString("o");
Byte[] GetBytes(string str) => Encoding.UTF8.GetBytes(str);


for (int i = 1; i < 21; i++)
{
    Thread.Sleep(2000);
    var message = $"SND {i} {GetTimeStamp()} {SERVICE_2_ADDR}:{SERVICE_2_PORT}";

    channel.BasicPublish(exchange: EXCHANGE_NAME, body: GetBytes(message), routingKey: MESSAGE_QUEUE);

    var json = JsonSerializer.Serialize(new ServerMessage { message = message, origin = $"{ip}:{OWN_PORT}" });
    var jsonContent = new StringContent(json, Encoding.UTF8, new MediaTypeHeaderValue("application/json"));

    try
    {
        var res = await client.PostAsync($"http://{SERVICE_2_ADDR}:{SERVICE_2_PORT}", jsonContent );
        channel.BasicPublish(exchange: EXCHANGE_NAME, body: GetBytes($"{(int)res.StatusCode} {GetTimeStamp()}"), routingKey: LOG_QUEUE);
    }
    catch (Exception e)
    {
        Console.WriteLine(e.Message);
        channel.BasicPublish(exchange: EXCHANGE_NAME, body: GetBytes(e.Message), routingKey: LOG_QUEUE);
    }
}

channel.BasicPublish(exchange: EXCHANGE_NAME, body: GetBytes(STOP), routingKey: LOG_QUEUE);

while(true) {
    Thread.Sleep(2000);
    Console.WriteLine("Waiting for docker-compose down");
}

class ServerMessage
{
    public string message { get; set; } = "";
    public string origin { get; set; } = "";
}
