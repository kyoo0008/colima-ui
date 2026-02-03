use serde::{Deserialize, Serialize};
use std::process::Command;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct Container {
    pub id: String,
    pub names: Vec<String>,
    pub image: String,
    #[serde(rename = "ImageID")]
    pub image_id: String,
    pub command: String,
    pub created: i64,
    pub ports: Vec<Port>,
    pub state: String,
    pub status: String,
    pub labels: std::collections::HashMap<String, String>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct Port {
    #[serde(rename = "IP")]
    pub ip: Option<String>,
    pub private_port: u16,
    pub public_port: Option<u16>,
    #[serde(rename = "Type")]
    pub port_type: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct Image {
    pub id: String,
    pub parent_id: String,
    pub repo_tags: Option<Vec<String>>,
    pub repo_digests: Option<Vec<String>>,
    pub created: i64,
    pub size: i64,
    pub shared_size: i64,
    pub virtual_size: Option<i64>,
    pub labels: Option<std::collections::HashMap<String, String>>,
    pub containers: i64,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct Volume {
    pub name: String,
    pub driver: String,
    pub mountpoint: String,
    pub created_at: Option<String>,
    pub status: Option<std::collections::HashMap<String, String>>,
    pub labels: Option<std::collections::HashMap<String, String>>,
    pub scope: String,
    pub options: Option<std::collections::HashMap<String, String>>,
    pub usage_data: Option<UsageData>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct UsageData {
    pub size: i64,
    pub ref_count: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ContainerStats {
    pub cpu_percent: f64,
    pub memory_usage: u64,
    pub memory_limit: u64,
    pub memory_percent: f64,
    pub network_rx: u64,
    pub network_tx: u64,
    pub block_read: u64,
    pub block_write: u64,
}

fn run_docker_command(args: &[&str]) -> Result<String, String> {
    let output = Command::new("docker")
        .args(args)
        .output()
        .map_err(|e| format!("Failed to execute docker command: {}", e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
fn list_containers() -> Result<Vec<Container>, String> {
    let output = run_docker_command(&["ps", "-a", "--format", "{{json .}}"])?;

    let containers: Vec<Container> = output
        .lines()
        .filter(|line| !line.is_empty())
        .filter_map(|line| {
            // Docker ps --format json returns a simplified format
            // We need to parse it and create our Container struct
            let parsed: Result<serde_json::Value, _> = serde_json::from_str(line);
            match parsed {
                Ok(v) => {
                    let id = v["ID"].as_str().unwrap_or("").to_string();
                    let names = vec![v["Names"].as_str().unwrap_or("").to_string()];
                    let image = v["Image"].as_str().unwrap_or("").to_string();
                    let command = v["Command"].as_str().unwrap_or("").to_string();
                    let state = v["State"].as_str().unwrap_or("").to_string();
                    let status = v["Status"].as_str().unwrap_or("").to_string();
                    let created_at = v["CreatedAt"].as_str().unwrap_or("");

                    // Parse ports from string like "0.0.0.0:8080->80/tcp"
                    let ports_str = v["Ports"].as_str().unwrap_or("");
                    let ports = parse_ports(ports_str);

                    // Parse created time
                    let created = parse_created_at(created_at);

                    Some(Container {
                        id,
                        names,
                        image: image.clone(),
                        image_id: String::new(),
                        command,
                        created,
                        ports,
                        state,
                        status,
                        labels: std::collections::HashMap::new(),
                    })
                }
                Err(_) => None,
            }
        })
        .collect();

    Ok(containers)
}

fn parse_ports(ports_str: &str) -> Vec<Port> {
    if ports_str.is_empty() {
        return vec![];
    }

    ports_str
        .split(", ")
        .filter_map(|port| {
            // Format: "0.0.0.0:8080->80/tcp" or "80/tcp"
            if port.contains("->") {
                let parts: Vec<&str> = port.split("->").collect();
                if parts.len() == 2 {
                    let host_part = parts[0];
                    let container_part = parts[1];

                    let (ip, public_port) = if host_part.contains(':') {
                        let hp: Vec<&str> = host_part.rsplitn(2, ':').collect();
                        (Some(hp.get(1).unwrap_or(&"").to_string()), hp.first().and_then(|p| p.parse().ok()))
                    } else {
                        (None, host_part.parse().ok())
                    };

                    let (private_port, port_type) = if container_part.contains('/') {
                        let cp: Vec<&str> = container_part.split('/').collect();
                        (cp.first().and_then(|p| p.parse().ok()).unwrap_or(0), cp.get(1).unwrap_or(&"tcp").to_string())
                    } else {
                        (container_part.parse().unwrap_or(0), "tcp".to_string())
                    };

                    return Some(Port {
                        ip,
                        private_port,
                        public_port,
                        port_type,
                    });
                }
            }
            None
        })
        .collect()
}

fn parse_created_at(created_at: &str) -> i64 {
    // Try to parse the date string, fallback to current time
    chrono::DateTime::parse_from_str(created_at, "%Y-%m-%d %H:%M:%S %z")
        .map(|dt| dt.timestamp())
        .unwrap_or_else(|_| chrono::Utc::now().timestamp())
}

#[tauri::command]
fn container_action(container_id: String, action: String) -> Result<String, String> {
    let args: Vec<&str> = match action.as_str() {
        "start" => vec!["start", &container_id],
        "stop" => vec!["stop", &container_id],
        "restart" => vec!["restart", &container_id],
        "remove" => vec!["rm", "-f", &container_id],
        "pause" => vec!["pause", &container_id],
        "unpause" => vec!["unpause", &container_id],
        _ => return Err(format!("Unknown action: {}", action)),
    };

    run_docker_command(&args)
}

#[tauri::command]
fn get_container_logs(container_id: String, tail: u32) -> Result<String, String> {
    let tail_str = tail.to_string();
    run_docker_command(&["logs", "--tail", &tail_str, &container_id])
}

#[tauri::command]
fn inspect_container(container_id: String) -> Result<String, String> {
    let output = run_docker_command(&["inspect", &container_id])?;
    // Return first element of the array
    let parsed: Vec<serde_json::Value> = serde_json::from_str(&output)
        .map_err(|e| format!("Failed to parse inspect output: {}", e))?;

    if let Some(first) = parsed.first() {
        serde_json::to_string(first)
            .map_err(|e| format!("Failed to serialize: {}", e))
    } else {
        Err("No container found".to_string())
    }
}

#[tauri::command]
fn get_container_stats(container_id: String) -> Result<String, String> {
    let output = run_docker_command(&["stats", "--no-stream", "--format", "{{json .}}", &container_id])?;

    if let Some(line) = output.lines().next() {
        let v: serde_json::Value = serde_json::from_str(line)
            .map_err(|e| format!("Failed to parse stats: {}", e))?;

        // Parse percentage strings
        let cpu_str = v["CPUPerc"].as_str().unwrap_or("0%");
        let mem_str = v["MemPerc"].as_str().unwrap_or("0%");
        let mem_usage_str = v["MemUsage"].as_str().unwrap_or("0B / 0B");
        let net_io_str = v["NetIO"].as_str().unwrap_or("0B / 0B");
        let block_io_str = v["BlockIO"].as_str().unwrap_or("0B / 0B");

        let cpu_percent = cpu_str.trim_end_matches('%').parse::<f64>().unwrap_or(0.0);
        let memory_percent = mem_str.trim_end_matches('%').parse::<f64>().unwrap_or(0.0);

        let (memory_usage, memory_limit) = parse_memory_usage(mem_usage_str);
        let (network_rx, network_tx) = parse_io_stats(net_io_str);
        let (block_read, block_write) = parse_io_stats(block_io_str);

        let stats = ContainerStats {
            cpu_percent,
            memory_usage,
            memory_limit,
            memory_percent,
            network_rx,
            network_tx,
            block_read,
            block_write,
        };

        serde_json::to_string(&stats)
            .map_err(|e| format!("Failed to serialize stats: {}", e))
    } else {
        Err("No stats available".to_string())
    }
}

fn parse_memory_usage(s: &str) -> (u64, u64) {
    let parts: Vec<&str> = s.split(" / ").collect();
    if parts.len() == 2 {
        (parse_size(parts[0]), parse_size(parts[1]))
    } else {
        (0, 0)
    }
}

fn parse_io_stats(s: &str) -> (u64, u64) {
    let parts: Vec<&str> = s.split(" / ").collect();
    if parts.len() == 2 {
        (parse_size(parts[0]), parse_size(parts[1]))
    } else {
        (0, 0)
    }
}

fn parse_size(s: &str) -> u64 {
    let s = s.trim();
    let multiplier = if s.ends_with("GB") || s.ends_with("GiB") {
        1024 * 1024 * 1024
    } else if s.ends_with("MB") || s.ends_with("MiB") {
        1024 * 1024
    } else if s.ends_with("KB") || s.ends_with("KiB") || s.ends_with("kB") {
        1024
    } else {
        1
    };

    let num_str = s.trim_end_matches(|c: char| !c.is_numeric() && c != '.');
    num_str.parse::<f64>().unwrap_or(0.0) as u64 * multiplier
}

#[tauri::command]
fn list_images() -> Result<Vec<Image>, String> {
    let output = run_docker_command(&["images", "--format", "{{json .}}"])?;

    let images: Vec<Image> = output
        .lines()
        .filter(|line| !line.is_empty())
        .filter_map(|line| {
            let v: serde_json::Value = serde_json::from_str(line).ok()?;

            let repo = v["Repository"].as_str().unwrap_or("<none>");
            let tag = v["Tag"].as_str().unwrap_or("<none>");
            let repo_tags = if repo != "<none>" {
                Some(vec![format!("{}:{}", repo, tag)])
            } else {
                Some(vec![])
            };

            let id = v["ID"].as_str().unwrap_or("").to_string();
            let size_str = v["Size"].as_str().unwrap_or("0B");
            let created_str = v["CreatedAt"].as_str().unwrap_or("");

            Some(Image {
                id: format!("sha256:{}", id),
                parent_id: String::new(),
                repo_tags,
                repo_digests: None,
                created: parse_created_at(created_str),
                size: parse_size(size_str) as i64,
                shared_size: 0,
                virtual_size: None,
                labels: None,
                containers: 0,
            })
        })
        .collect();

    Ok(images)
}

#[tauri::command]
fn remove_image(image_id: String) -> Result<String, String> {
    run_docker_command(&["rmi", &image_id])
}

#[tauri::command]
fn pull_image(image_name: String) -> Result<String, String> {
    run_docker_command(&["pull", &image_name])
}

#[tauri::command]
fn list_volumes() -> Result<Vec<Volume>, String> {
    let output = run_docker_command(&["volume", "ls", "--format", "{{json .}}"])?;

    let volumes: Vec<Volume> = output
        .lines()
        .filter(|line| !line.is_empty())
        .filter_map(|line| {
            let v: serde_json::Value = serde_json::from_str(line).ok()?;

            Some(Volume {
                name: v["Name"].as_str().unwrap_or("").to_string(),
                driver: v["Driver"].as_str().unwrap_or("").to_string(),
                mountpoint: v["Mountpoint"].as_str().unwrap_or("").to_string(),
                created_at: None,
                status: None,
                labels: None,
                scope: v["Scope"].as_str().unwrap_or("local").to_string(),
                options: None,
                usage_data: None,
            })
        })
        .collect();

    Ok(volumes)
}

#[tauri::command]
fn remove_volume(volume_name: String) -> Result<String, String> {
    run_docker_command(&["volume", "rm", &volume_name])
}

#[tauri::command]
fn create_volume(volume_name: String) -> Result<String, String> {
    run_docker_command(&["volume", "create", &volume_name])
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            list_containers,
            container_action,
            get_container_logs,
            inspect_container,
            get_container_stats,
            list_images,
            remove_image,
            pull_image,
            list_volumes,
            remove_volume,
            create_volume
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
