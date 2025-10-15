document.addEventListener("DOMContentLoaded", () => {
    // Estado global de la aplicación
    const state = {
        data: [],
        filteredData: [],
        chartTypes: {
            chart1: 'pie',
            chart2: 'bar',
            chart3: 'line',
            chart4: 'scatter'
        },
        currentTab: 'chart1'
    };

    // Inicializar el dashboard
    initDashboard();
    
    function initDashboard() {
        // Cargar datos desde CSV
        loadDataFromCSV();
        
        // Configurar todos los componentes
        setupEventListeners();
        updateHeaderStats();
        showLoadingState();
    }

    function loadDataFromCSV() {
        // Ruta al archivo CSV - ajusta esta ruta según tu estructura de archivos
        const csvPath = '/data/autos_electricos_cleaned.csv'; // o './data/autos_electricos.csv'
        
        // Usar PapaParse para cargar y parsear el CSV
        Papa.parse(csvPath, {
            download: true,
            header: true,
            dynamicTyping: true,
            complete: function(results) {
                console.log("Datos cargados desde CSV:", results.data);
                
                // Procesar los datos del CSV
                processCSVData(results.data);
                
                // Configurar filtros y actualizar gráficos
                setupFilters();
                setupTabs();
                updateCharts();
                updateKeyInsights();
                hideLoadingState();
            },
            error: function(error) {
                console.error("Error al cargar el CSV:", error);
                showErrorState("Error al cargar los datos. Usando datos de ejemplo.");
                
                // En caso de error, cargar datos de ejemplo
                loadSampleData();
            }
        });
    }

    function processCSVData(csvData) {
        // Filtrar filas vacías o inválidas y procesar los datos
        const processedData = csvData.filter(row => 
            row && row.year && row.region && row.mode && row.sales_volume
        ).map(row => {
            // Convertir y limpiar los datos según las columnas proporcionadas
            return {
                year: parseInt(row.year) || 0,
                region: String(row.region).trim(),
                mode: String(row.mode).trim(), // Cambiado de category a mode
                parameter: String(row.parameter || '').trim(),
                category: String(row.category || '').trim(), // Mantenemos category por si acaso
                powertrain: String(row.powertrain || '').trim(),
                unit: String(row.unit || '').trim(),
                value: parseFloat(row.value) || 0,
                price: parseFloat(row.price) || 0,
                range_km: parseFloat(row.range_km) || 0,
                charging_time: parseFloat(row.charging_time) || 0,
                sales_volume: parseFloat(row.sales_volume) || 0,
                co2_saved: parseFloat(row.co2_saved) || 0,
                battery_capacity: parseFloat(row.battery_capacity) || 0,
                energy_efficiency: parseFloat(row.energy_efficiency) || 0,
                weight_kg: parseFloat(row.weight_kg) || 0,
                number_of_seats: parseInt(row.number_of_seats) || 0,
                motor_power: parseFloat(row.motor_power) || 0,
                distance_traveled: parseFloat(row.distance_traveled) || 0,
                
                // Campos adicionales para compatibilidad con los gráficos existentes
                efficiency: parseFloat(row.energy_efficiency) ? (1000 / parseFloat(row.energy_efficiency)).toFixed(2) : 0, // Convertir Wh/km a km/kWh
                range: parseFloat(row.range_km) || 0
            };
        });
        
        state.data = processedData;
        state.filteredData = [...processedData];
        
        console.log("Datos procesados:", state.data);
    }

    function loadSampleData() {
        // Datos de ejemplo como fallback - usando "mode" en lugar de "category"
        const modes = ['Sedán', 'SUV', 'Compacto', 'Deportivo', 'Furgoneta']; // Cambiado de categories a modes
        const regions = ['Norteamérica', 'Europa', 'Asia-Pacífico', 'Latinoamérica', 'África'];
        const years = [2018, 2019, 2020, 2021, 2022, 2023];
        
        const sampleData = [];
        
        years.forEach(year => {
            regions.forEach(region => {
                modes.forEach(mode => { // Cambiado de category a mode
                    // Generar datos realistas con tendencias
                    const baseSales = 500 + (year - 2018) * 300;
                    const regionMultiplier = {
                        'Norteamérica': 1.5,
                        'Europa': 1.3,
                        'Asia-Pacífico': 1.8,
                        'Latinoamérica': 0.7,
                        'África': 0.5
                    };
                    
                    const modeMultiplier = { // Cambiado de categoryMultiplier a modeMultiplier
                        'Sedán': 1.2,
                        'SUV': 1.5,
                        'Compacto': 1.0,
                        'Deportivo': 0.8,
                        'Furgoneta': 0.6
                    };
                    
                    const sales = Math.round(
                        baseSales * 
                        regionMultiplier[region] * 
                        modeMultiplier[mode] * // Cambiado de category a mode
                        (0.8 + Math.random() * 0.4)
                    );
                    
                    // Datos adicionales basados en las columnas reales
                    const energy_efficiency = 150 + Math.random() * 100; // Wh/km
                    const efficiency = (1000 / energy_efficiency).toFixed(2); // km/kWh
                    const price = 30000 + Math.random() * 70000; // Precio en USD
                    const range_km = 200 + Math.random() * 400; // Autonomía en km
                    const battery_capacity = 40 + Math.random() * 80; // kWh
                    const motor_power = 100 + Math.random() * 300; // kW
                    const co2_saved = sales * (0.1 + Math.random() * 0.3); // toneladas
                    
                    sampleData.push({
                        year,
                        region,
                        mode: mode, // Cambiado de category a mode
                        parameter: "ventas totales",
                        category: mode, // Mantenemos category para compatibilidad
                        powertrain: "BEV",
                        unit: "unidades",
                        value: sales,
                        price: price,
                        range_km: range_km,
                        charging_time: 4 + Math.random() * 8,
                        sales_volume: sales,
                        co2_saved: co2_saved,
                        battery_capacity: battery_capacity,
                        energy_efficiency: energy_efficiency,
                        weight_kg: 1500 + Math.random() * 1000,
                        number_of_seats: 4 + Math.floor(Math.random() * 3),
                        motor_power: motor_power,
                        distance_traveled: sales * (10000 + Math.random() * 20000),
                        // Campos para compatibilidad
                        efficiency: efficiency,
                        range: range_km
                    });
                });
            });
        });
        
        state.data = sampleData;
        state.filteredData = [...sampleData];
        
        // Configurar filtros y actualizar gráficos
        setupFilters();
        setupTabs();
        updateCharts();
        updateKeyInsights();
        hideLoadingState();
    }

    function showErrorState(message) {
        // Mostrar mensaje de error
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #F44336;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            max-width: 300px;
        `;
        errorDiv.innerHTML = `
            <strong>Error</strong>
            <p>${message}</p>
        `;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.style.opacity = '0';
            errorDiv.style.transition = 'opacity 0.5s';
            setTimeout(() => document.body.removeChild(errorDiv), 500);
        }, 5000);
    }

    function setupEventListeners() {
        // Botón de reset de filtros
        document.getElementById('resetFilters').addEventListener('click', resetFilters);
        
        // Botones de exportación
        document.getElementById('exportCSV').addEventListener('click', exportCSV);
        document.getElementById('exportPNG').addEventListener('click', exportPNG);
        document.getElementById('exportPDF').addEventListener('click', exportPDF);
        
        // Botones de cambio de tipo de gráfico
        document.querySelectorAll('.chart-action-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const chartId = this.dataset.chart;
                const chartType = this.dataset.type;
                
                // Actualizar estado
                state.chartTypes[chartId] = chartType;
                
                // Actualizar UI
                document.querySelectorAll(`[data-chart="${chartId}"]`).forEach(b => {
                    b.classList.remove('active');
                });
                this.classList.add('active');
                
                // Redibujar gráfico
                updateSingleChart(chartId);
            });
        });
    }

    function setupFilters() {
        const yearFilter = document.getElementById("yearFilter");
        const regionFilter = document.getElementById("regionFilter");
        const vehicleTypeFilter = document.getElementById("vehicleTypeFilter");

        // Limpiar filtros existentes
        yearFilter.innerHTML = '<option value="">Todos</option>';
        regionFilter.innerHTML = '<option value="">Todas</option>';
        vehicleTypeFilter.innerHTML = '<option value="">Todos</option>';

        // Obtener valores únicos - usando "mode" en lugar de "category"
        const years = [...new Set(state.data.map(d => d.year))].sort();
        const regions = [...new Set(state.data.map(d => d.region))].sort();
        const modes = [...new Set(state.data.map(d => d.mode))].sort(); // Cambiado de categories a modes

        // Llenar filtro de años
        years.forEach(y => {
            const opt = document.createElement("option");
            opt.value = y;
            opt.text = y;
            yearFilter.add(opt);
        });

        // Llenar filtro de regiones
        regions.forEach(r => {
            const opt = document.createElement("option");
            opt.value = r;
            opt.text = r;
            regionFilter.add(opt);
        });

        // Llenar filtro de tipos de vehículo - usando "mode"
        modes.forEach(m => { // Cambiado de categories a modes
            const opt = document.createElement("option");
            opt.value = m;
            opt.text = m;
            vehicleTypeFilter.add(opt);
        });

        // Event listeners para filtros
        yearFilter.addEventListener("change", () => updateCharts());
        regionFilter.addEventListener("change", () => updateCharts());
        vehicleTypeFilter.addEventListener("change", () => updateCharts());
    }

    function setupTabs() {
        const buttons = document.querySelectorAll(".tab-button");
        buttons.forEach(btn => {
            btn.addEventListener("click", () => {
                // Actualizar UI
                document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
                document.querySelectorAll(".chart").forEach(c => c.classList.remove("visible"));
                btn.classList.add("active");
                
                // Actualizar estado y mostrar pestaña
                state.currentTab = btn.dataset.target;
                document.getElementById(btn.dataset.target).classList.add("visible");
                
                // Asegurar que el gráfico se renderice correctamente
                setTimeout(() => updateSingleChart(btn.dataset.target), 100);
            });
        });
    }

    function updateCharts() {
        applyFilters();
        updateHeaderStats();
        
        // Actualizar todos los gráficos visibles
        document.querySelectorAll('.chart.visible').forEach(chartElement => {
            updateSingleChart(chartElement.id);
        });
        
        updateKeyInsights();
    }

    function updateSingleChart(chartId) {
        switch(chartId) {
            case 'chart1':
                drawChartByCategory();
                break;
            case 'chart2':
                drawChartByRegion();
                break;
            case 'chart3':
                drawChartByYear();
                break;
            case 'chart4':
                drawChartComparison();
                break;
        }
    }

    function applyFilters() {
        const yearFilter = document.getElementById("yearFilter").value;
        const regionFilter = document.getElementById("regionFilter").value;
        const vehicleTypeFilter = document.getElementById("vehicleTypeFilter").value;

        let filtered = [...state.data];
        
        if (yearFilter) filtered = filtered.filter(d => d.year == yearFilter);
        if (regionFilter) filtered = filtered.filter(d => d.region == regionFilter);
        if (vehicleTypeFilter) filtered = filtered.filter(d => d.mode == vehicleTypeFilter); // Cambiado de category a mode

        state.filteredData = filtered;
    }

    function drawChartByCategory() {
        // Cambiado de "category" a "mode"
        const byMode = groupSum(state.filteredData, "mode", "sales_volume");
        const chartType = state.chartTypes.chart1;
        const colors = ['#2E86AB', '#A23B72', '#F18F01', '#4CAF50', '#FF9800', '#9C27B0'];
        
        let trace;
        
        if (chartType === 'bar') {
            trace = {
                x: byMode.map(d => d.key),
                y: byMode.map(d => d.value),
                type: "bar",
                marker: { 
                    color: byMode.map((d, i) => colors[i % colors.length]), // Asignar colores individualmente
                    line: {
                        color: '#2D3436',
                        width: 1
                    }
                },
                text: byMode.map(d => d.value.toLocaleString()),
                textposition: 'auto'
            };
        } else {
            trace = {
                labels: byMode.map(d => d.key),
                values: byMode.map(d => d.value),
                type: "pie",
                marker: { colors: byMode.map((d, i) => colors[i % colors.length]) }, // Asignar colores individualmente
                textinfo: 'label+percent',
                hoverinfo: 'label+value+percent',
                hole: 0.4,
                rotation: 45
            };
        }
        
        const layout = {
            title: false,
            xaxis: { 
                title: "Tipo de Vehículo (Modo)",
                tickangle: -45
            },
            yaxis: { 
                title: "Unidades Vendidas",
                gridcolor: '#f0f0f0'
            },
            plot_bgcolor: "#fafafa",
            paper_bgcolor: "#fff",
            font: { family: 'Roboto, sans-serif' },
            margin: { t: 10, b: 100, l: 60, r: 20 },
            showlegend: chartType !== 'bar'
        };
        
        Plotly.react("chart1-content", [trace], layout, { 
            responsive: true,
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d']
        });
    }

    function drawChartByRegion() {
        const byRegion = groupSum(state.filteredData, "region", "sales_volume");
        const chartType = state.chartTypes.chart2;
        const colors = ['#2E86AB', '#A23B72', '#F18F01', '#4CAF50', '#FF9800'];
        
        let trace;
        
        if (chartType === 'bar') {
            trace = {
                x: byRegion.map(d => d.key),
                y: byRegion.map(d => d.value),
                type: "bar",
                marker: { 
                    color: byRegion.map((d, i) => colors[i % colors.length]), // Asignar colores individualmente
                    line: {
                        color: '#2D3436',
                        width: 1
                    }
                },
                text: byRegion.map(d => d.value.toLocaleString()),
                textposition: 'auto'
            };
        } else {
            // Para el tipo "map", mostramos un gráfico de barras horizontales
            trace = {
                x: byRegion.map(d => d.value),
                y: byRegion.map(d => d.key),
                type: "bar",
                orientation: "h",
                marker: { 
                    color: byRegion.map((d, i) => colors[i % colors.length]), // Asignar colores individualmente
                    line: {
                        color: '#2D3436',
                        width: 1
                    }
                }
            };
        }
        
        const layout = {
            title: false,
            xaxis: { 
                title: chartType === 'bar' ? "Unidades Vendidas" : "",
                gridcolor: '#f0f0f0'
            },
            yaxis: { 
                title: chartType === 'bar' ? "Región" : "Unidades Vendidas",
                gridcolor: '#f0f0f0'
            },
            plot_bgcolor: "#fafafa",
            paper_bgcolor: "#fff",
            font: { family: 'Roboto, sans-serif' },
            margin: { t: 10, b: 60, l: 100, r: 20 }
        };
        
        Plotly.react("chart2-content", [trace], layout, { 
            responsive: true,
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d']
        });
    }

    function drawChartByYear() {
        // CORRECCIÓN: Usar state.filteredData en lugar de state.data
        const byYear = groupSum(state.filteredData, "year", "sales_volume");
        const chartType = state.chartTypes.chart3;
        
        let trace;
        
        if (chartType === 'line') {
            trace = {
                x: byYear.map(d => d.key),
                y: byYear.map(d => d.value),
                type: "scatter",
                mode: "lines+markers",
                line: { 
                    color: '#2E86AB', 
                    width: 4,
                    shape: 'spline'
                },
                marker: { 
                    size: 8,
                    color: '#2E86AB'
                },
                fill: 'none'
            };
        } else {
            // Área
            trace = {
                x: byYear.map(d => d.key),
                y: byYear.map(d => d.value),
                type: "scatter",
                mode: "lines",
                line: { 
                    color: '#2E86AB', 
                    width: 3
                },
                fill: 'tozeroy',
                fillcolor: 'rgba(46, 134, 171, 0.2)'
            };
        }
        
        const layout = {
            title: false,
            xaxis: { 
                title: "Año",
                gridcolor: '#f0f0f0'
            },
            yaxis: { 
                title: "Unidades Vendidas",
                gridcolor: '#f0f0f0'
            },
            plot_bgcolor: "#fafafa",
            paper_bgcolor: "#fff",
            font: { family: 'Roboto, sans-serif' },
            margin: { t: 10, b: 60, l: 60, r: 20 }
        };
        
        Plotly.react("chart3-content", [trace], layout, { 
            responsive: true,
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d']
        });
    }

    function drawChartComparison() {
        const chartType = state.chartTypes.chart4;
        
        // Filtrar datos que tengan valores válidos
        const validData = state.filteredData.filter(d => 
            d.efficiency > 0 && d.price > 0 && d.range_km > 0
        );
        
        if (validData.length === 0) {
            document.getElementById("chart4-content").innerHTML = `
                <div class="loading">
                    <p>No hay datos suficientes para mostrar la comparación</p>
                </div>
            `;
            return;
        }
        
        if (chartType === 'scatter') {
            // Gráfico de dispersión: Eficiencia vs Precio
            const trace = {
                x: validData.map(d => parseFloat(d.efficiency)),
                y: validData.map(d => d.price),
                mode: 'markers',
                type: 'scatter',
                marker: {
                    size: 8,
                    color: validData.map(d => {
                        // Color por región
                        const regions = ['Norteamérica', 'Europa', 'Asia-Pacífico', 'Latinoamérica', 'África'];
                        const colors = ['#2E86AB', '#A23B72', '#F18F01', '#4CAF50', '#FF9800'];
                        const regionIndex = regions.indexOf(d.region);
                        return regionIndex >= 0 ? colors[regionIndex % colors.length] : '#78909C';
                    }),
                    opacity: 0.7
                },
                text: validData.map(d => 
                    `${d.mode} - ${d.region} (${d.year})<br>Eficiencia: ${d.efficiency} km/kWh<br>Precio: $${d.price.toLocaleString()}` // Cambiado de category a mode
                ),
                hoverinfo: 'text'
            };
            
            const layout = {
                title: false,
                xaxis: { 
                    title: {
                        text: "Eficiencia (km/kWh)",
                        font: {
                            size: 14,
                            family: 'Roboto, sans-serif',
                            color: '#2D3436'
                        }
                    },
                    gridcolor: '#f0f0f0',
                    tickfont: {
                        size: 12,
                        family: 'Roboto, sans-serif'
                    },
                    showgrid: true,
                    zeroline: true,
                    zerolinecolor: '#e0e0e0'
                },
                yaxis: { 
                    title: {
                        text: "Precio (USD)",
                        font: {
                            size: 14,
                            family: 'Roboto, sans-serif',
                            color: '#2D3436'
                        }
                    },
                    gridcolor: '#f0f0f0',
                    tickfont: {
                        size: 12,
                        family: 'Roboto, sans-serif'
                    },
                    tickformat: '$,.0f',
                    showgrid: true,
                    zeroline: true,
                    zerolinecolor: '#e0e0e0'
                },
                plot_bgcolor: "#fafafa",
                paper_bgcolor: "#fff",
                font: { 
                    family: 'Roboto, sans-serif',
                    size: 12
                },
                margin: { 
                    t: 40, 
                    b: 80,
                    l: 80, 
                    r: 40 
                },
                showlegend: false,
                hoverlabel: {
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    bordercolor: '#2E86AB',
                    font: {
                        family: 'Roboto, sans-serif',
                        size: 12
                    }
                }
            };
            
            Plotly.react("chart4-content", [trace], layout, { 
                responsive: true,
                displayModeBar: true,
                displaylogo: false,
                modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d']
            });
        } else {
            // Gráfico de burbujas: Autonomía vs Precio, tamaño por volumen de ventas
            const trace = {
                x: validData.map(d => d.range_km),
                y: validData.map(d => d.price),
                mode: 'markers',
                type: 'scatter',
                marker: {
                    size: validData.map(d => Math.sqrt(d.sales_volume) / 10),
                    color: validData.map(d => {
                        // Color por modo (tipo de vehículo) - cambiado de category a mode
                        const modes = [...new Set(state.data.map(d => d.mode))].sort();
                        const colors = ['#2E86AB', '#A23B72', '#F18F01', '#4CAF50', '#FF9800'];
                        const modeIndex = modes.indexOf(d.mode);
                        return modeIndex >= 0 ? colors[modeIndex % colors.length] : '#78909C';
                    }),
                    opacity: 0.7,
                    sizemode: 'diameter',
                    sizeref: 0.1,
                    sizemin: 4
                },
                text: validData.map(d => 
                    `${d.mode} - ${d.region}<br>Autonomía: ${d.range_km} km<br>Precio: $${d.price.toLocaleString()}<br>Ventas: ${d.sales_volume.toLocaleString()}` // Cambiado de category a mode
                ),
                hoverinfo: 'text'
            };
            
            const layout = {
                title: false,
                xaxis: { 
                    title: {
                        text: "Autonomía (km)",
                        font: {
                            size: 14,
                            family: 'Roboto, sans-serif',
                            color: '#2D3436'
                        }
                    },
                    gridcolor: '#f0f0f0',
                    tickfont: {
                        size: 12,
                        family: 'Roboto, sans-serif'
                    },
                    showgrid: true,
                    zeroline: true,
                    zerolinecolor: '#e0e0e0'
                },
                yaxis: { 
                    title: {
                        text: "Precio (USD)",
                        font: {
                            size: 14,
                            family: 'Roboto, sans-serif',
                            color: '#2D3436'
                        }
                    },
                    gridcolor: '#f0f0f0',
                    tickfont: {
                        size: 12,
                        family: 'Roboto, sans-serif'
                    },
                    tickformat: '$,.0f',
                    showgrid: true,
                    zeroline: true,
                    zerolinecolor: '#e0e0e0'
                },
                plot_bgcolor: "#fafafa",
                paper_bgcolor: "#fff",
                font: { 
                    family: 'Roboto, sans-serif',
                    size: 12
                },
                margin: { 
                    t: 40, 
                    b: 80,
                    l: 80, 
                    r: 40 
                },
                showlegend: false,
                hoverlabel: {
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    bordercolor: '#2E86AB',
                    font: {
                        family: 'Roboto, sans-serif',
                        size: 12
                    }
                }
            };
            
            Plotly.react("chart4-content", [trace], layout, { 
                responsive: true,
                displayModeBar: true,
                displaylogo: false,
                modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d']
            });
        }
    }

    function groupSum(data, key, value) {
        const map = {};
        data.forEach(d => {
            if (!d[key]) return;
            map[d[key]] = (map[d[key]] || 0) + (parseFloat(d[value]) || 0);
        });
        return Object.keys(map).map(k => ({ key: k, value: map[k] }));
    }

    function updateHeaderStats() {
        // Actualizar estadísticas en el header
        const totalVehicles = state.filteredData.reduce((sum, d) => sum + d.sales_volume, 0);
        const totalRegions = new Set(state.filteredData.map(d => d.region)).size;
        const totalYears = new Set(state.filteredData.map(d => d.year)).size;
        
        document.getElementById('total-vehicles').textContent = totalVehicles.toLocaleString();
        document.getElementById('total-regions').textContent = totalRegions;
        document.getElementById('total-years').textContent = totalYears;
    }

    function updateKeyInsights() {
        // Generar insights automáticamente basados en los datos - usando "mode" en lugar de "category"
        const byMode = groupSum(state.filteredData, "mode", "sales_volume"); // Cambiado de byCategory a byMode
        const byRegion = groupSum(state.filteredData, "region", "sales_volume");
        const byYear = groupSum(state.filteredData, "year", "sales_volume"); // Cambiado a filteredData
        
        if (byMode.length === 0 || byRegion.length === 0 || byYear.length === 0) {
            document.getElementById('key-insights').innerHTML = `
                <p>No hay datos suficientes para generar insights.</p>
            `;
            return;
        }
        
        // Encontrar modo y región más vendidos - cambiado de category a mode
        const topMode = byMode.reduce((max, item) => item.value > max.value ? item : max, byMode[0]); // Cambiado de topCategory a topMode
        const topRegion = byRegion.reduce((max, item) => item.value > max.value ? item : max, byRegion[0]);
        
        // Calcular crecimiento anual
        let growth = 0;
        if (byYear.length > 1) {
            const currentYear = byYear[byYear.length - 1].value;
            const previousYear = byYear[byYear.length - 2].value;
            growth = ((currentYear - previousYear) / previousYear * 100).toFixed(1);
        }
        
        // Calcular promedios para insights adicionales
        const avgPrice = state.filteredData.reduce((sum, d) => sum + d.price, 0) / state.filteredData.length;
        const avgRange = state.filteredData.reduce((sum, d) => sum + d.range_km, 0) / state.filteredData.length;
        
        const insights = `
            <ul>
                <li><strong>${topMode.key}</strong> es el tipo de vehículo más vendido con ${topMode.value.toLocaleString()} unidades.</li> <!-- Cambiado de categoría a tipo de vehículo -->
                <li><strong>${topRegion.key}</strong> lidera las ventas regionales con ${topRegion.value.toLocaleString()} unidades.</li>
                <li>El mercado muestra un crecimiento del <strong>${growth}%</strong> en el último año.</li>
                <li>Precio promedio: <strong>$${avgPrice.toLocaleString(undefined, {maximumFractionDigits: 0})}</strong></li>
                <li>Autonomía promedio: <strong>${avgRange.toLocaleString(undefined, {maximumFractionDigits: 0})} km</strong></li>
            </ul>
        `;
        
        document.getElementById('key-insights').innerHTML = insights;
    }

    function resetFilters() {
        document.getElementById("yearFilter").value = "";
        document.getElementById("regionFilter").value = "";
        document.getElementById("vehicleTypeFilter").value = "";
        updateCharts();
        
        // Efecto visual de confirmación
        const btn = document.getElementById('resetFilters');
        btn.classList.add('pulse');
        setTimeout(() => btn.classList.remove('pulse'), 1000);
    }

    function exportCSV() {
        // Convertir datos a CSV con todas las columnas
        const headers = [
            'Año', 'Región', 'Modo', 'Parámetro', 'Categoría', 'Powertrain', 
            'Unidad', 'Valor', 'Precio', 'Autonomía_km', 'Tiempo_Carga', 
            'Volumen_Ventas', 'CO2_Ahorrado', 'Capacidad_Batería', 
            'Eficiencia_Energética', 'Peso_kg', 'Número_Asientos', 
            'Potencia_Motor', 'Distancia_Recorrida'
        ];
        
        const csvData = state.filteredData.map(d => [
            d.year, d.region, d.mode, d.parameter, d.category, d.powertrain, // Cambiado category por mode
            d.unit, d.value, d.price.toFixed(2), d.range_km.toFixed(2), 
            d.charging_time.toFixed(2), d.sales_volume, d.co2_saved.toFixed(2),
            d.battery_capacity.toFixed(2), d.energy_efficiency.toFixed(2),
            d.weight_kg.toFixed(2), d.number_of_seats, d.motor_power.toFixed(2),
            d.distance_traveled.toFixed(2)
        ]);
        
        const csvContent = [headers, ...csvData]
            .map(row => row.join(','))
            .join('\n');
        
        // Descargar archivo
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'datos_vehiculos_electricos.csv';
        a.click();
        URL.revokeObjectURL(url);
        
        showExportFeedback('CSV exportado correctamente');
    }

    function exportPNG() {
        // Exportar el gráfico actual como PNG
        const currentChart = document.querySelector('.chart.visible .chart-content');
        if (currentChart && currentChart._fullLayout) {
            Plotly.toImage(currentChart, {
                format: 'png',
                width: 1200,
                height: 800
            }).then(function(dataUrl) {
                const a = document.createElement('a');
                a.href = dataUrl;
                a.download = 'grafico_vehiculos_electricos.png';
                a.click();
                
                showExportFeedback('Gráfico exportado como PNG');
            });
        } else {
            showExportFeedback('No hay gráfico visible para exportar');
        }
    }

    function exportPDF() {
        // Para PDF, usamos una librería externa en un caso real
        showExportFeedback('Funcionalidad PDF en desarrollo');
    }

    function showExportFeedback(message) {
        // Mostrar mensaje de confirmación
        const feedback = document.createElement('div');
        feedback.textContent = message;
        feedback.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.style.opacity = '0';
            feedback.style.transition = 'opacity 0.5s';
            setTimeout(() => document.body.removeChild(feedback), 500);
        }, 3000);
    }

    function showLoadingState() {
        // Mostrar estado de carga en los gráficos
        document.querySelectorAll('.chart-content').forEach(container => {
            container.innerHTML = `
                <div class="loading">
                    <div class="loading-spinner"></div>
                    <p>Cargando datos...</p>
                </div>
            `;
        });
    }

    function hideLoadingState() {
        // Quitar estado de carga
        document.querySelectorAll('.loading').forEach(loading => {
            loading.remove();
        });
    }
});