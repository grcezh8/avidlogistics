using System;

namespace AVIDLogistics.Domain.Exceptions
{
    public class InvalidElectionStateException : Exception
    {
        public InvalidElectionStateException(string message) : base(message) { }
    }
}
