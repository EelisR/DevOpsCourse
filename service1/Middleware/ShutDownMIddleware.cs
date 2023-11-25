using RabbitMQ.Client;
using Services;

namespace Middleware;

public class ShutDownMiddleware
{
    private readonly IModel _channel;
    private readonly RequestDelegate _next;
    private readonly Service1 _service1;

    public ShutDownMiddleware(RequestDelegate next, IModel channel, Service1 service1)
    {
        _next = next;
        _channel = channel;
        _service1 = service1;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        await _next(context);

        var state = _service1.GetState();

        if (state != null && state == Enums.ServiceState.SHUTDOWN)
        {
            Console.WriteLine("Shutting down");
            _channel.Close();
            Environment.Exit(0);
        }
    }
}
