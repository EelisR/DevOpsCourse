using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

const string SERVICE_2_ADDR = "localhost";
const string SERVICE_2_PORT = "8000";
const string LOG_FILE = "../logs/service1.log";
const string STOP = "STOP";

using var file = File.Create(LOG_FILE);
file.Dispose();

using var writer = new StreamWriter(LOG_FILE, append: true);
using var client = new HttpClient();

for (int i = 1; i < 3; i++)
{
    Thread.Sleep(2000);
    var message = $"{i} {DateTime.Now} {SERVICE_2_ADDR}:{SERVICE_2_PORT}";
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
