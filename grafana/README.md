```
sudo chown -R 1000:1000 /opt/docker/grafana/
sudo mkdir -p /opt/docker/grafana/{grafana_data,prometheus_data,loki_data,mimir_data,tempo_data,alloy_data}
sudo chown -R 472:472 /opt/docker/grafana/grafana_data
sudo chown -R 65534:65534 /opt/docker/grafana/prometheus_data
```