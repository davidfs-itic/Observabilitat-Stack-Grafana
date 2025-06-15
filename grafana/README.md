```
sudo mkdir -p /opt/docker/grafana/grafana_data
sudo mkdir -p /opt/docker/grafana/loki_data
sudo mkdir -p /opt/docker/grafana/mimir_data
sudo mkdir -p /opt/docker/grafana/tempo_data
sudo chown -R 1000:1000 /opt/docker/grafana/ # Canvia 1000:1000 per un UID/GID adequat si saps quin és
sudo chmod -R 775 /opt/docker/grafana/
```
```
sudo chown -R 1000:1000 /opt/docker/grafana/
sudo mkdir -p /opt/docker/grafana/{grafana_data,prometheus_data,loki_data,mimir_data,tempo_data,alloy_data}
sudo chown -R 472:472 /opt/docker/grafana/grafana_data
sudo chown -R 65534:65534 /opt/docker/grafana/prometheus_data
```
chown -R 1000:1000 /opt/docker/grafana/
mkdir -p /opt/docker/grafana/{grafana_data,prometheus_data,loki_data,mimir_data,tempo_data,alloy_data}
chown -R 472:472 /opt/docker/grafana/grafana_data
chown -R 65534:65534 /opt/docker/grafana/prometheus_data