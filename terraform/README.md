# 🏗️ Day 7: Infrastructure as Code (IaC) with Terraform & Cloud Readiness

This directory contains the declarative **Infrastructure as Code (IaC)** configuration for **THE-MovieBox** platform using **Terraform**.

---

## 📌 Architecture Overview

The Terraform manifests provision a cloud environment on AWS designed to host containerized microservices and monitoring workloads:

```
                      +---------------------------------------------------+
                      |                    AWS Cloud                      |
                      |                                                   |
                      |  Custom VPC (10.0.0.0/16)                         |
                      |  +---------------------------------------------+  |
                      |  | Public Subnet (10.0.1.0/24, 10.0.2.0/24)    |  |
                      |  | - Internet Gateway (IGW)                    |  |
                      |  | - Elastic IP + NAT Gateway                  |  |
                      |  | - Web/Frontend SG (Ports 80, 443, 3000)    |  |
                      |  | - Observability SG (Ports 9090, 3005)       |  |
                      |  | - EC2/EKS Compute Node (Ubuntu 22.04)       |  |
                      |  +---------------------------------------------+  |
                      |  | Private Subnet (10.0.10.0/24, 10.0.20.0/24)|  |
                      |  | - Microservices Backend SG (5001, 5002)     |  |
                      |  | - Internal Traffic Only (NAT Outbound)      |  |
                      |  +---------------------------------------------+  |
                      +---------------------------------------------------+
```

---

## 🛠️ File Structure

| File | Purpose |
| :--- | :--- |
| [`main.tf`](file:///d:/Coding/DevOps%20Projects/THE-MovieBox/terraform/main.tf) | AWS Provider, VPC, Subnets, Gateways, Security Groups, and Compute Node. |
| [`variables.tf`](file:///d:/Coding/DevOps%20Projects/THE-MovieBox/terraform/variables.tf) | Configurable variables (`aws_region`, `environment`, `instance_type`, `vpc_cidr`). |
| [`outputs.tf`](file:///d:/Coding/DevOps%20Projects/THE-MovieBox/terraform/outputs.tf) | Resource outputs (VPC ID, Subnet IDs, Security Group IDs, Server IP). |
| [`terraform.tfvars.example`](file:///d:/Coding/DevOps%20Projects/THE-MovieBox/terraform/terraform.tfvars.example) | Template variable file with default production settings. |
| [`README.md`](file:///d:/Coding/DevOps%20Projects/THE-MovieBox/terraform/README.md) | Documentation & deployment workflow guide. |

---

## 🔒 Security Groups Configuration

| Security Group | Port(s) | Description | Target Component |
| :--- | :--- | :--- | :--- |
| **Web SG** | `80`, `443`, `3000` | Inbound HTTP/HTTPS & Next.js Frontend | `frontend` |
| **Backend SG** | `5001`, `5002` | Auth & Movie Microservices | `auth-service`, `movie-service` |
| **Monitoring SG** | `9090`, `3005` | Prometheus Metrics & Grafana UI | `prometheus`, `grafana` |
| **Management SG** | `22`, `6443` | SSH Administration & K8s API Server | Cluster Management |

---

## 🚀 Execution Workflow

### Prerequisites
1. Install [Terraform CLI](https://developer.hashicorp.com/terraform/downloads) (`>= 1.5.0`).
2. Configure AWS Credentials (`aws configure` or environment variables `AWS_ACCESS_KEY_ID` & `AWS_SECRET_ACCESS_KEY`).

### Step 1: Initialize Workspace
Initialize the working directory and download the AWS Provider plugin:
```bash
cd terraform
terraform init
```

### Step 2: Format & Validate
Ensure your HCL files conform to standard formatting and syntax:
```bash
terraform fmt
terraform validate
```

### Step 3: Configure Environment Variables
Create your `terraform.tfvars` from the provided example:
```bash
cp terraform.tfvars.example terraform.tfvars
```

### Step 4: Preview Execution Plan
Generate and inspect the dry-run execution plan:
```bash
terraform plan
```

### Step 5: Apply Infrastructure Changes
Provision the cloud infrastructure on AWS:
```bash
terraform apply
```
*To auto-approve without interactive prompt:*
```bash
terraform apply -auto-approve
```

### Step 6: Verify Outputs & Extract SSH Private Key
Display resource outputs after successful provisioning:
```bash
terraform output
```

To extract the generated `.pem` private key directly for your GitHub Actions **`EC2_SSH_KEY`** secret:
```bash
terraform output -raw private_key_pem
```
Copy the full string printed (including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`) and paste it into **GitHub Repository Settings → Secrets → New repository secret** as `EC2_SSH_KEY`.

### Step 7: Teardown / Cleanup
To destroy all provisioned cloud resources:
```bash
terraform destroy
```
