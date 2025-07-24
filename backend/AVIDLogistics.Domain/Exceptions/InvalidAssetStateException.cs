using System;

namespace AVIDLogistics.Domain.Exceptions
{
    public class InvalidAssetStateException : Exception
    {
        public InvalidAssetStateException(string message) : base(message) { }
    }
}
