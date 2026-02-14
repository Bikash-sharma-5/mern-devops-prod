module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "19.15.3"

  cluster_name    = "mern-devops-cluster"
  cluster_version = "1.30"

  vpc_id                         = module.vpc.vpc_id
  subnet_ids                     = module.vpc.private_subnets
  cluster_endpoint_public_access = true

  eks_managed_node_groups = {
    nodes = {
      min_size     = 1
      max_size     = 2 # Reduced to save cost
      desired_size = 1 # Just 1 node is enough for a MERN app demo

      instance_types = ["t3.small"] 
      capacity_type  = "SPOT" # <--- This is the big money saver!
    }
  }
}