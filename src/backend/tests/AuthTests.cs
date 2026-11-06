using Analytics.Infrastructure.Auth;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace Analytics.Tests;

public class JwtConfigTests
{
    [Fact]
    public void Configuration_Keys_Present()
    {
        var cfg = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string,string?>
        {
            ["Jwt:Key"] = "test-key-123456789012345678901234",
            ["Jwt:Issuer"] = "iss", ["Jwt:Audience"] = "aud"
        }).Build();
        Assert.Equal("iss", cfg["Jwt:Issuer"]);
    }
}