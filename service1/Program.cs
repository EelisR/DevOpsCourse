using System.Diagnostics;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Sockets;
using System.Text;
using System.Text.Json;

string SERVICE_2_ADDR = Environment.GetEnvironmentVariable("SERVICE_2_ADDRESS") ?? "localhost";
string SERVICE_2_PORT = Environment.GetEnvironmentVariable("SERVICE_2_PORT") ?? "8000";
string OWN_PORT = Environment.GetEnvironmentVariable("OWN_PORT") ?? "4001";
string MQ_ADDRESS = Environment.GetEnvironmentVariable("MQ_ADDRESS") ?? "localhost";
const string STOP = "STOP";

Process.Start("./wait-for-it.sh", $"{MQ_ADDRESS}").WaitForExit();

using var client = new HttpClient();

var dns = Dns.GetHostEntry(Dns.GetHostName());

// Quite unintuitive
var ip = dns.AddressList.FirstOrDefault(x => x.AddressFamily == AddressFamily.InterNetwork);

for (int i = 1; i < 21; i++)
{
    Thread.Sleep(2000);
    var message = $"SND {i} {DateTime.Now.ToUniversalTime().ToString("o")} {SERVICE_2_ADDR}:{SERVICE_2_PORT}";

    var json = JsonSerializer.Serialize(new ServerMessage { message = message, origin = $"{ip}:{OWN_PORT}" });
    var jsonContent = new StringContent(json, Encoding.UTF8, new MediaTypeHeaderValue("application/json"));

    try
    {
        var res = await client.PostAsync($"http://{SERVICE_2_ADDR}:{SERVICE_2_PORT}", jsonContent );
    }
    catch (Exception e)
    {
        Console.WriteLine(e.Message);
    }
}

var stopJson = JsonSerializer.Serialize(new ServerMessage { message = STOP });

class ServerMessage
{
    public string message { get; set; } = "";
    public string origin { get; set; } = "";
}
