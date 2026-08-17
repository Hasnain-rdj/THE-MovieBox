terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# =============================================================================
# 1. Custom VPC & Internet Gateway
# =============================================================================
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "the-moviebox-vpc-${var.environment}"
    Environment = var.environment
    Project     = "THE-MovieBox"
    ManagedBy   = "Terraform"
  }
}

resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name        = "the-moviebox-igw-${var.environment}"
    Environment = var.environment
    Project     = "THE-MovieBox"
    ManagedBy   = "Terraform"
  }
}

# =============================================================================
# 2. Subnets (Public & Private across multiple AZs)
# =============================================================================
resource "aws_subnet" "public" {
  count                   = length(var.public_subnet_cidrs)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name                                         = "the-moviebox-public-subnet-${count.index + 1}-${var.environment}"
    Environment                                  = var.environment
    Project                                      = "THE-MovieBox"
    ManagedBy                                    = "Terraform"
    "kubernetes.io/role/elb"                     = "1"
    "kubernetes.io/cluster/the-moviebox-cluster" = "shared"
  }
}

resource "aws_subnet" "private" {
  count             = length(var.private_subnet_cidrs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name                                         = "the-moviebox-private-subnet-${count.index + 1}-${var.environment}"
    Environment                                  = var.environment
    Project                                      = "THE-MovieBox"
    ManagedBy                                    = "Terraform"
    "kubernetes.io/role/internal-elb"            = "1"
    "kubernetes.io/cluster/the-moviebox-cluster" = "shared"
  }
}

# =============================================================================
# 3. NAT Gateway, Elastic IP, and Route Tables
# =============================================================================
resource "aws_eip" "nat" {
  domain     = "vpc"
  depends_on = [aws_internet_gateway.gw]

  tags = {
    Name        = "the-moviebox-nat-eip-${var.environment}"
    Environment = var.environment
    Project     = "THE-MovieBox"
    ManagedBy   = "Terraform"
  }
}

resource "aws_nat_gateway" "nat" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id

  tags = {
    Name        = "the-moviebox-nat-gw-${var.environment}"
    Environment = var.environment
    Project     = "THE-MovieBox"
    ManagedBy   = "Terraform"
  }
}

# Public Route Table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }

  tags = {
    Name        = "the-moviebox-public-rt-${var.environment}"
    Environment = var.environment
    Project     = "THE-MovieBox"
    ManagedBy   = "Terraform"
  }
}

resource "aws_route_table_association" "public" {
  count          = length(var.public_subnet_cidrs)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# Private Route Table
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat.id
  }

  tags = {
    Name        = "the-moviebox-private-rt-${var.environment}"
    Environment = var.environment
    Project     = "THE-MovieBox"
    ManagedBy   = "Terraform"
  }
}

resource "aws_route_table_association" "private" {
  count          = length(var.private_subnet_cidrs)
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}

# =============================================================================
# 4. Security Groups Definition
# =============================================================================

# Web / LoadBalancer SG (ports 80, 443, 3000)
resource "aws_security_group" "web_sg" {
  name        = "the-moviebox-web-sg-${var.environment}"
  description = "Security group for Web Frontend and Load Balancer (Ports 80, 443, 3000)"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTP Traffic"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS Traffic"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Frontend Next.js App Service"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "the-moviebox-web-sg-${var.environment}"
    Environment = var.environment
    Project     = "THE-MovieBox"
    ManagedBy   = "Terraform"
  }
}

# Microservices Backend SG (Auth port 5001, Movie port 5002)
resource "aws_security_group" "backend_sg" {
  name        = "the-moviebox-backend-sg-${var.environment}"
  description = "Security group for Microservices Backend (Auth: 5001, Movie: 5002)"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Auth Service API"
    from_port       = 5001
    to_port         = 5001
    protocol        = "tcp"
    security_groups = [aws_security_group.web_sg.id]
  }

  ingress {
    description     = "Movie Service API"
    from_port       = 5002
    to_port         = 5002
    protocol        = "tcp"
    security_groups = [aws_security_group.web_sg.id]
  }

  ingress {
    description = "Internal Backend Microservices Inter-communication"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    self        = true
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "the-moviebox-backend-sg-${var.environment}"
    Environment = var.environment
    Project     = "THE-MovieBox"
    ManagedBy   = "Terraform"
  }
}

# Monitoring SG (Prometheus port 9090, Grafana port 3005)
resource "aws_security_group" "monitoring_sg" {
  name        = "the-moviebox-monitoring-sg-${var.environment}"
  description = "Security group for Observability (Prometheus: 9090, Grafana: 3005/3000)"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "Prometheus UI & Scraping Endpoint"
    from_port   = 9090
    to_port     = 9090
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Grafana Dashboards (Exposed NodePort/LoadBalancer)"
    from_port   = 3005
    to_port     = 3005
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Grafana Internal Container Port"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "the-moviebox-monitoring-sg-${var.environment}"
    Environment = var.environment
    Project     = "THE-MovieBox"
    ManagedBy   = "Terraform"
  }
}

# SSH & Management SG
resource "aws_security_group" "management_sg" {
  name        = "the-moviebox-mgmt-sg-${var.environment}"
  description = "Security group for SSH access and Kubernetes API Server"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "SSH Access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Kubernetes API Server Endpoint"
    from_port   = 6443
    to_port     = 6443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "the-moviebox-mgmt-sg-${var.environment}"
    Environment = var.environment
    Project     = "THE-MovieBox"
    ManagedBy   = "Terraform"
  }
}

# =============================================================================
# 5. Dynamic SSH Key Pair & EC2 / EKS Compute Node Definition
# =============================================================================
resource "tls_private_key" "pk" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "kp" {
  key_name   = var.key_name
  public_key = tls_private_key.pk.public_key_openssh

  tags = {
    Name        = var.key_name
    Environment = var.environment
    Project     = "THE-MovieBox"
    ManagedBy   = "Terraform"
  }
}

data "aws_ami" "ubuntu" {
  most_recent = true
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
  owners = ["099720109477"] # Canonical
}

resource "aws_instance" "app_node" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  subnet_id     = aws_subnet.public[0].id
  key_name      = aws_key_pair.kp.key_name
  vpc_security_group_ids = [
    aws_security_group.web_sg.id,
    aws_security_group.backend_sg.id,
    aws_security_group.monitoring_sg.id,
    aws_security_group.management_sg.id
  ]

  root_block_device {
    volume_size           = 30
    volume_type           = "gp3"
    delete_on_termination = true
  }

  user_data = <<-EOF
              #!/bin/bash
              set -e
              apt-get update -y
              apt-get install -y docker.io curl git
              systemctl enable --now docker
              usermod -aG docker ubuntu

              # Install K3s Lightweight Kubernetes Engine with Docker integration
              curl -sfL https://get.k3s.io | sh -s - --docker

              # Configure kubeconfig permissions for ubuntu user
              mkdir -p /home/ubuntu/.kube
              cp /etc/rancher/k3s/k3s.yaml /home/ubuntu/.kube/config
              chown -R ubuntu:ubuntu /home/ubuntu/.kube
              chmod 600 /home/ubuntu/.kube/config

              # Set KUBECONFIG environment variable
              echo "export KUBECONFIG=/home/ubuntu/.kube/config" >> /home/ubuntu/.bashrc
              echo "alias k='kubectl'" >> /home/ubuntu/.bashrc

              echo "THE-MovieBox Cloud Compute Node & K3s Cluster Ready!" > /tmp/readiness.txt
              EOF

  tags = {
    Name        = "the-moviebox-node-${var.environment}"
    Environment = var.environment
    Project     = "THE-MovieBox"
    ManagedBy   = "Terraform"
    Role        = "Container Workload Host"
  }
}
