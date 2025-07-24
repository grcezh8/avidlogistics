using System;

namespace AVIDLogistics.Domain.Exceptions
{
    public class DuplicateAssetException : Exception
    {
        public DuplicateAssetException(string message) : base(message) { }
    }
}