import {IServer, IServerInfo} from "../IServer";
import {ISshClientOptions, SshClient} from "../SshClient";

const requestPromise = require("request-promise-native");

const logger = console;

interface IRegion {
    city: string;
    country: string;
    location: string;
}

function getRegion(slug: string): IRegion {
    switch (slug) {        case "nyc1":
        case "nyc2":
        case "nyc3":
            return {
                city: "New York",
                country: "us",
                location: "40.7128,-74.0060",
            };
        case "sgp1":
        case "sgp2":
        case "sgp3":
            return {
                city: "Singapore",
                country: "sg",
                location: "1.3521,103.8198",
            };
        case "lon1":
        case "lon2":
        case "lon3":
            return {
                city: "London",
                country: "uk",
                location: "51.5074,0.1278",
            };
        case "ams1":
        case "ams2":
        case "ams3":
            return {
                city: "Amsterdam",
                country: "nl",
                location: "52.3702,4.8952",
            };
        case "fra1":
        case "fra2":
        case "fra3":
            return {
                city: "Frankfurt",
                country: "de",
                location: "50.1109,8.6821",
            };
        case "tor1":
        case "tor2":
        case "tor3":
            return {
                city: "Toronto",
                country: "ca",
                location: "43.6532,-79.3832",
            };
        case "sfo1":
        case "sfo2":
        case "sfo3":
            return {
                city: "San Francisco",
                country: "us",
                location: "37.7749,-122.4194",
            };
        case "blr1":
        case "blr2":
        case "blr3":
            return {
                city: "Bangalore",
                country: "in",
                location: "12.9716,77.5946",
            };
        default:
            return {
                city: "",
                country: "",
                location: "",
            };
    }
}

export default class DigitalOceanServer implements IServer {
    public readonly serverInfo: any;
    private readonly clientOptions: ISshClientOptions;
    private readonly id: string;
    private readonly sizes: any;

    constructor(id: string, serverInfo: any, sizes: any, clientOptions: ISshClientOptions) {
        this.id = id;
        this.serverInfo = serverInfo;
        this.clientOptions = clientOptions;
        this.sizes = sizes;
    }

    public async getInfo(): Promise<IServerInfo> {
        const size = this.sizes.find((s) => s.slug === this.serverInfo.size_slug);

        return {
            city: getRegion(this.serverInfo.region.slug).city,
            cores: this.serverInfo.vcpus,
            country: getRegion(this.serverInfo.region.slug).country,
            id: this.id,
            location: getRegion(this.serverInfo.region.slug).location,
            memory: Math.round(this.serverInfo.memory / 1024),
            os: `${this.serverInfo.image.slug}`,
            priceHourly: size.price_hourly,
            priceMonthly: size.price_monthly,
            transfer: size.transfer,
            volumeSize: this.serverInfo.disk,
            volumeType: "ssd",
        };
    }

    public async connect(): Promise<IClient> {
        const client = new SshClient(this.clientOptions);
        while (true) {
            try {
                await client.connect();
                break;
            } catch (e) {
                logger.log(`Error during connection to server ${this.serverInfo.name}: ${e.message}\nTrying again...`);
                await new Promise((resolve) => setTimeout(resolve, 30000));
            }
        }
        return client;
    }
}
