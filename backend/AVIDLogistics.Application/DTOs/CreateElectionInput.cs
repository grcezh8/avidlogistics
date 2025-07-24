namespace AVIDLogistics.Application.DTOs
{
    public class CreateElectionInput
    {
        public string Name { get; set; } = string.Empty;
        public DateTime ElectionDate { get; set; }
        public string Description { get; set; } = string.Empty;
        public string ElectionType { get; set; } = string.Empty;
        public DateTime ScheduledDate { get; set; }
    }
}
