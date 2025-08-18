using System;

namespace AVIDLogistics.Domain.Exceptions
{
    public class AssetNotFoundException : Exception
    {
        public AssetNotFoundException(string message) : base(message)
        {
        }

        public AssetNotFoundException(string message, Exception innerException) : base(message, innerException)
        {
        }
    }
}
