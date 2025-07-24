using System;

namespace AVIDLogistics.Domain.Exceptions
{
    public class InvalidAssetException : Exception
    {
        public InvalidAssetException(string message) : base(message) { }
    }
}
