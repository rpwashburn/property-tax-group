#! /bin/bash

function check_docker_container_already_running() {
    if docker ps | grep -q "fightyourtax-ai"; then
        echo "Docker container is already running"
    else
        echo "Docker container is not running"
        docker compose up -d
    fi
}

function start_pnpm_dev() {
    rm -rf .next
    pnpm dev
}

check_docker_container_already_running
start_pnpm_dev