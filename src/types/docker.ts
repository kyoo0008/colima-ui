export interface Container {
  Id: string;
  Names: string[];
  Image: string;
  ImageID: string;
  Command: string;
  Created: number;
  Ports: Port[];
  State: string;
  Status: string;
  Labels: Record<string, string>;
}

export interface Port {
  IP?: string;
  PrivatePort: number;
  PublicPort?: number;
  Type: string;
}

export interface ContainerInspect {
  Id: string;
  Created: string;
  Path: string;
  Args: string[];
  State: {
    Status: string;
    Running: boolean;
    Paused: boolean;
    Restarting: boolean;
    OOMKilled: boolean;
    Dead: boolean;
    Pid: number;
    ExitCode: number;
    Error: string;
    StartedAt: string;
    FinishedAt: string;
  };
  Image: string;
  Name: string;
  RestartCount: number;
  Config: {
    Hostname: string;
    Env: string[];
    Cmd: string[];
    Image: string;
    WorkingDir: string;
    Labels: Record<string, string>;
  };
  NetworkSettings: {
    IPAddress: string;
    Ports: Record<string, PortBinding[] | null>;
  };
  Mounts: Mount[];
}

export interface PortBinding {
  HostIp: string;
  HostPort: string;
}

export interface Mount {
  Type: string;
  Source: string;
  Destination: string;
  Mode: string;
  RW: boolean;
}

export interface ContainerStats {
  cpu_percent: number;
  memory_usage: number;
  memory_limit: number;
  memory_percent: number;
  network_rx: number;
  network_tx: number;
  block_read: number;
  block_write: number;
}

export interface Image {
  Id: string;
  ParentId: string;
  RepoTags: string[];
  RepoDigests: string[];
  Created: number;
  Size: number;
  SharedSize: number;
  VirtualSize: number;
  Labels: Record<string, string> | null;
  Containers: number;
}

export interface Volume {
  Name: string;
  Driver: string;
  Mountpoint: string;
  CreatedAt: string;
  Status: Record<string, string> | null;
  Labels: Record<string, string> | null;
  Scope: string;
  Options: Record<string, string> | null;
  UsageData: {
    Size: number;
    RefCount: number;
  } | null;
}

export interface BuildHistory {
  id: string;
  image: string;
  status: 'building' | 'success' | 'failed';
  startedAt: string;
  finishedAt?: string;
  logs: string[];
}

export type TabType = 'containers' | 'images' | 'volumes' | 'builds';

export type ContainerAction = 'start' | 'stop' | 'restart' | 'remove' | 'pause' | 'unpause';
