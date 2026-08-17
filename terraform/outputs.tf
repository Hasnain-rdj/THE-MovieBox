output "vpc_id" {
  description = "The unique ID of the created custom VPC."
  value       = aws_vpc.main.id
}

output "vpc_cidr_block" {
  description = "The primary CIDR block of the VPC."
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  description = "List of IDs for created public subnets."
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "List of IDs for created private subnets."
  value       = aws_subnet.private[*].id
}

output "nat_gateway_ip" {
  description = "Public Elastic IP assigned to the NAT Gateway."
  value       = aws_eip.nat.public_ip
}

output "web_security_group_id" {
  description = "Security Group ID for Web Frontend and Load Balancer (ports 80, 443, 3000)."
  value       = aws_security_group.web_sg.id
}

output "backend_security_group_id" {
  description = "Security Group ID for Backend Microservices (ports 5001, 5002)."
  value       = aws_security_group.backend_sg.id
}

output "monitoring_security_group_id" {
  description = "Security Group ID for Observability (ports 9090, 3005)."
  value       = aws_security_group.monitoring_sg.id
}

output "management_security_group_id" {
  description = "Security Group ID for SSH and Management (ports 22, 6443)."
  value       = aws_security_group.management_sg.id
}

output "server_public_ip" {
  description = "Public IP address of the compute node hosting microservices workloads."
  value       = aws_instance.app_node.public_ip
}

output "server_public_dns" {
  description = "Public DNS hostname of the compute node."
  value       = aws_instance.app_node.public_dns
}

output "server_instance_id" {
  description = "EC2 Instance ID of the compute node."
  value       = aws_instance.app_node.id
}

output "private_key_pem" {
  description = "The generated RSA private key in PEM format to be added as EC2_SSH_KEY secret in GitHub Actions."
  value       = tls_private_key.pk.private_key_pem
  sensitive   = true
}
