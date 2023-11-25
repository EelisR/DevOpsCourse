using System.Diagnostics;
using RabbitMQ.Client;
using Services;

string SERVICE_2_ADDR = Environment.GetEnvironmentVariable("SERVICE_2_ADDRESS") ?? "localhost";
string SERVICE_2_PORT = Environment.GetEnvironmentVariable("SERVICE_2_PORT") ?? "8000";
string Service_2_URl = $"{SERVICE_2_ADDR}:{SERVICE_2_PORT}";
string OWN_PORT = Environment.GetEnvironmentVariable("OWN_PORT") ?? "4001";

string MQ_ADDRESS = Environment.GetEnvironmentVariable("MQ_ADDRESS") ?? "localhost";
string MQ_PORT = Environment.GetEnvironmentVariable("MQ_PORT") ?? "5672";

// Wait for RabbitMQ to start
Process.Start("./wait-for-it.sh", $"{MQ_ADDRESS}:{MQ_PORT}").WaitForExit();

// Initialise the RabbitMQ connection and channels
var factory = new ConnectionFactory() { HostName = MQ_ADDRESS, Port = int.Parse(MQ_PORT) };
using var connection = factory.CreateConnection();
using var channel = connection.CreateModel();
channel.ExchangeDeclare("devops", ExchangeType.Topic, true);
channel.QueueDeclare("message", durable: true, exclusive: false, autoDelete: true);
channel.QueueDeclare("log", durable: true, exclusive: false, autoDelete: false);
channel.QueueBind("message", "devops", "message");
channel.QueueBind("log", "devops", "log");

// Wait for the service 2 to start
Process.Start("./wait-for-it.sh", Service_2_URl).WaitForExit();

var service1 = new Service1(Service_2_URl, OWN_PORT, channel);

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton(service1);

var app = builder.Build();

app.Services.GetService<Service1>()?.Sender();

app.MapPut(
    "/state/{state}",
    (Enums.ServiceState state) =>
    {
        Console.WriteLine($"State change requested. New state: {state}");
        var newState = app.Services.GetService<Service1>()?.SetState(state);
        return newState.ToString();
    }
);

app.MapGet("/state", () => app.Services.GetService<Service1>()?.GetState().ToString());

app.MapGet(
    "/shutdown",
    () =>
    {
        Console.WriteLine("Shutdown requested");
        connection.Abort();
        connection.Dispose();
        var stopped = app.StopAsync();
        if (stopped.IsCompletedSuccessfully)
        {
            return 200;
        }
        else
        {
            return 500;
        }
    }
);

app.Run();
