using AVIDLogistics.Domain.Entities;

namespace AVIDLogistics.Application.Interfaces
{
    public interface ISignatureRepository
    {
        Task<int> SaveAsync(Signature signature);
        Task<Signature?> GetByIdAsync(int signatureId);
        Task<IEnumerable<Signature>> GetByChainOfCustodyEventIdAsync(int chainOfCustodyEventId);
        Task<bool> UpdateAsync(Signature signature);
        Task<bool> DeleteAsync(int signatureId);
        Task<IEnumerable<Signature>> GetBySignedByAsync(string signedBy);
        Task<IEnumerable<Signature>> GetInvalidSignaturesAsync();
    }
}
