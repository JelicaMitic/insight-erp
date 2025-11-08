public class AnalyticsEtlHostedService : BackgroundService
{
    private readonly IServiceProvider _sp;
    private readonly ILogger<AnalyticsEtlHostedService> _logger;

    public AnalyticsEtlHostedService(IServiceProvider sp, ILogger<AnalyticsEtlHostedService> logger)
    {
        _sp = sp;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var now = DateTime.UtcNow;
            var nextRun = now.Date.AddDays(1).AddHours(1); // 01:00 UTC
            var delay = nextRun - now;

            _logger.LogInformation("[ETL Scheduler] Next run at {time:u}", nextRun);

            await Task.Delay(delay, stoppingToken);

            using var scope = _sp.CreateScope();
            var etl = scope.ServiceProvider.GetRequiredService<IAnalyticsEtlService>();

            try
            {
                var written = await etl.RunYesterdayAsync(stoppingToken);
                _logger.LogInformation("[ETL Scheduler] Daily ETL completed: {written} docs", written);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[ETL Scheduler] ETL failed");
            }
        }
    }
}
