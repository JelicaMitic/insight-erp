public interface IAnalyticsEtlService
{
    Task<int> RunAsync(DateTime from, DateTime to, CancellationToken ct = default);
    Task<int> RunYesterdayAsync(CancellationToken ct = default);
}
