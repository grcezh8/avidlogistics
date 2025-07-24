using System;

namespace AVIDLogistics.Domain.Exceptions
{
    public class InvalidManifestStateException : Exception
    {
        public InvalidManifestStateException(string message) : base(message) { }
    }
}
