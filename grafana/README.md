```
sudo mkdir -p /opt/docker/grafana/grafana_data
sudo mkdir -p /opt/docker/grafana/loki_data
sudo mkdir -p /opt/docker/grafana/mimir_data
sudo mkdir -p /opt/docker/grafana/tempo_data
sudo chown -R 1000:1000 /opt/docker/grafana/ # Canvia 1000:1000 per un UID/GID adequat si saps quin és
sudo chmod -R 775 /opt/docker/grafana/
```
