import { MetalDevice } from "@generatedProviders/equinix/metal-device";
import { MetalBgpSession } from "@generatedProviders/equinix/metal-bgp-session";
import { MetalReservedIpBlock } from "@generatedProviders/equinix/metal-reserved-ip-block";
import { CloudinitProvider } from "@generatedProviders/cloudinit/provider";
import { DataCloudinitConfig } from "@generatedProviders/cloudinit/data-cloudinit-config";
import { EquinixProvider } from "@generatedProviders/equinix/provider";
import { App, Fn, TerraformOutput, TerraformStack } from "cdktf";
import { Construct } from "constructs";
import { readFileSync } from "fs";

const projectId = "f4db0408-fa3d-44b4-9547-7a1f15c6d132";
const edgeKey = "";

class PortainerAdmin extends TerraformStack {
	private device: MetalDevice;
	private cloudConfig: DataCloudinitConfig;
	public readonly reservedIpBlock: MetalReservedIpBlock;

	constructor(scope: Construct, id: string) {
		super(scope, id);

		new CloudinitProvider(this, "cloudinit", {});
		new EquinixProvider(this, "equinix", {});

		this.reservedIpBlock = new MetalReservedIpBlock(this, "reserved-ip-block", {
			projectId,
			type: "global_ipv4",
			quantity: 1,
		});

		this.cloudConfig = new DataCloudinitConfig(this, "cloud-config", {
			gzip: false,
			base64Encode: false,
			part: [
				{
					contentType: "text/x-shellscript",
					content: readFileSync("cloud-config/bootstrap.sh", "utf8"),
				},
				{
					contentType: "text/x-shellscript",
					content: readFileSync("cloud-config/docker-install.sh", "utf8"),
				},
				{
					contentType: "text/x-shellscript",
					content: readFileSync("cloud-config/portainer-install.sh", "utf8"),
				},
			],
		});

		this.device = new MetalDevice(this, "device", {
			projectId,
			hostname: "portainer-admin",
			metro: "fr",
			plan: "c3.small.x86",
			billingCycle: "hourly",
			operatingSystem: "ubuntu_22_04",
			userData: this.cloudConfig.rendered,
		});

		new MetalBgpSession(this, "bgp-session", {
			deviceId: this.device.id,
			addressFamily: "ipv4",
		});

		new TerraformOutput(this, "admin-ip", {
			value: this.device.accessPublicIpv4,
			sensitive: false,
		});

		new TerraformOutput(this, "bgp-ip", {
			value: this.reservedIpBlock.address,
			sensitive: false,
		});
	}
}

class PortainerAtEdge extends TerraformStack {
	private cloudConfig: DataCloudinitConfig;

	private readonly device: MetalDevice;

	constructor(
		scope: Construct,
		id: string,
		metro: string,
		adminStack: PortainerAdmin,
	) {
		super(scope, id);

		new CloudinitProvider(this, "cloudinit", {});
		new EquinixProvider(this, "equinix", {});

		this.cloudConfig = new DataCloudinitConfig(this, "cloud-config", {
			gzip: false,
			base64Encode: false,
			part: [
				{
					contentType: "text/x-shellscript",
					content: readFileSync("cloud-config/bootstrap.sh", "utf8"),
				},
				{
					contentType: "text/x-shellscript",
					content: readFileSync("cloud-config/docker-install.sh", "utf8"),
				},
				{
					contentType: "text/x-shellscript",
					content: readFileSync("cloud-config/portainer-agent.sh", "utf8"),
				},
				{
					contentType: "text/x-shellscript",
					content: readFileSync("cloud-config/bgp-setup.sh", "utf8"),
				},
			],
		});

		this.device = new MetalDevice(this, "device", {
			projectId,
			hostname: `portainer-at-edge-${metro}`,
			metro: metro,
			plan: "c3.small.x86",
			billingCycle: "hourly",
			operatingSystem: "ubuntu_22_04",
			userData: this.cloudConfig.rendered,
			customData: Fn.jsonencode({
				globalIp: adminStack.reservedIpBlock.address,
				edgeKey,
			}),
		});

		new MetalBgpSession(this, "bgp-session", {
			deviceId: this.device.id,
			addressFamily: "ipv4",
		});

		new TerraformOutput(this, "worker-ip", {
			value: this.device.accessPublicIpv4,
			sensitive: false,
		});
	}
}

const app = new App();

const adminStack = new PortainerAdmin(app, "admin");

new PortainerAtEdge(app, "us", "da", adminStack);
new PortainerAtEdge(app, "eu", "fr", adminStack);
new PortainerAtEdge(app, "as", "sg", adminStack);

app.synth();
