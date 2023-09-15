using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

string SERVICE_2_ADDR = Environment.GetEnvironmentVariable("SERVICE_2_ADDRESS") ?? "localhost";
string SERVICE_2_PORT = Environment.GetEnvironmentVariable("SERVICE_2_PORT") ?? "8000";
string FILE_PATH = Environment.GetEnvironmentVariable("FILE_PATH") ?? "../logs/service1.log";
const string STOP = "STOP";

using var file = File.Create(FILE_PATH);
file.Dispose();

using var writer = new StreamWriter(FILE_PATH, append: true);
using var client = new HttpClient();

for (int i = 1; i < 21; i++)
{
    Thread.Sleep(2000);
    var message = $"{i} {DateTime.Now.ToUniversalTime().ToString("o")} {SERVICE_2_ADDR}:{SERVICE_2_PORT}";
    writer.WriteLine(message);

    var json = JsonSerializer.Serialize(new ServerMessage { message = message });
    var jsonContent = new StringContent(json, Encoding.UTF8, new MediaTypeHeaderValue("application/json"));

    try
    {
        var res = await client.PostAsync($"http://{SERVICE_2_ADDR}:{SERVICE_2_PORT}", jsonContent );
    }
    catch (Exception e)
    {
        Console.WriteLine(e.Message);
        writer.WriteLine(e.Message);
    }
}

writer.WriteLine(STOP);
var stopJson = JsonSerializer.Serialize(new ServerMessage { message = STOP });
var stopJsonContent = new StringContent(stopJson, Encoding.UTF8, new MediaTypeHeaderValue("application/json"));

await client.PostAsync($"http://{SERVICE_2_ADDR}:{SERVICE_2_PORT}", stopJsonContent);

class ServerMessage
{
    public string message { get; set; } = "";
    public string origin { get; set; } = "";
}
