import dns from "dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

dns.resolveSrv(
    "_mongodb._tcp.navcluster.wv59qps.mongodb.net",
    (err, records) => {
        if (err) {
            console.error("❌ DNS failed:", err);
        } else {
            console.log("✅ DNS works:");
            console.log(records);
        }
    }
);