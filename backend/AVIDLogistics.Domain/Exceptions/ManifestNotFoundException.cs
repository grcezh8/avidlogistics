using System;

namespace AVIDLogistics.Domain.Exceptions
{
    public class ManifestNotFoundException : Exception
    {
        public ManifestNotFoundException(string message) : base(message)
        {
        }

        public ManifestNotFoundException(string message, Exception innerException) : base(message, innerException)
        {
        }
    }
}
