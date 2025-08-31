document.addEventListener("DOMContentLoaded", () => {
  // First check if running in Chrome extension context
  if (typeof chrome === "undefined" || !chrome.storage) {
    showError("Please open this page through the extension");
    return;
  }

  // Get chart canvas elements and set their dimensions
  const timeChartCanvas = document.getElementById("timeChart");
  const dailyChartCanvas = document.getElementById("dailyChart");
  const domainTableBody = document.getElementById("domain-table-body");

  if (!timeChartCanvas || !dailyChartCanvas) {
    showError("Chart elements not found - please refresh");
    return;
  }

  // Set explicit canvas dimensions
  timeChartCanvas.width = timeChartCanvas.offsetWidth;
  timeChartCanvas.height = 400;
  dailyChartCanvas.width = dailyChartCanvas.offsetWidth;
  dailyChartCanvas.height = 400;

  // Get 2D contexts
  const timeChartCtx = timeChartCanvas.getContext("2d");
  const dailyChartCtx = dailyChartCanvas.getContext("2d");

  let timeChart = null;
  let dailyChart = null;

  // Initial load
  loadDataAndRender();

  // Set up refresh interval
  const refreshInterval = setInterval(loadDataAndRender, 500000000);

  // Clean up on page unload
  window.addEventListener("beforeunload", () => {
    clearInterval(refreshInterval);
    if (timeChart) timeChart.destroy();
    if (dailyChart) dailyChart.destroy();
  });

  async function loadDataAndRender() {
    try {
      const timeData = await new Promise((resolve) => {
        chrome.storage.local.get("timeData", (result) => {
          if (chrome.runtime.lastError) {
            console.error("Storage error:", chrome.runtime.lastError);
            showError("Error loading data");
            resolve({});
            return;
          }
          resolve(result.timeData || {});
        });
      });

      renderCharts(timeData);
      renderDomainTable(timeData);
    } catch (error) {
      console.error("Error in loadDataAndRender:", error);
      showError("Failed to load data");
    }
  }

  function renderCharts(timeData) {
    // Process weekly data
    const dates = Object.keys(timeData).sort().slice(-7);
    if (dates.length === 0) dates.push(getCurrentDate());

    const weeklyData = {
      productive: dates.map(date => timeData[date]?.productive || 0),
      unproductive: dates.map(date => timeData[date]?.unproductive || 0),
      neutral: dates.map(date => timeData[date]?.neutral || 0)
    };

    // Process today's data
    const today = getCurrentDate();
    const todayData = timeData[today] || {
      productive: 0,
      unproductive: 0,
      neutral: 0
    };

    // Destroy existing charts before creating new ones
    if (timeChart) timeChart.destroy();
    if (dailyChart) dailyChart.destroy();

    try {
      // Create weekly bar chart
      timeChart = new Chart(timeChartCtx, {
        type: "bar",
        data: {
          labels: dates.map(formatDateForDisplay),
          datasets: [
            createDataset("Productive", weeklyData.productive, "75, 192, 192"),
            createDataset("Unproductive", weeklyData.unproductive, "255, 99, 132"),
            createDataset("Neutral", weeklyData.neutral, "201, 203, 207")
          ]
        },
        options: getBarChartOptions("Weekly Time Breakdown")
      });

      // Create daily pie chart
      dailyChart = new Chart(dailyChartCtx, {
        type: "pie",
        data: {
          labels: ["Productive", "Unproductive", "Neutral"],
          datasets: [{
            data: [todayData.productive, todayData.unproductive, todayData.neutral],
            backgroundColor: [
              "rgba(75, 192, 192, 0.7)",
              "rgba(255, 99, 132, 0.7)",
              "rgba(201, 203, 207, 0.7)"
            ],
            borderColor: [
              "rgba(75, 192, 192, 1)",
              "rgba(255, 99, 132, 1)",
              "rgba(201, 203, 207, 1)"
            ],
            borderWidth: 1
          }]
        },
        options: getPieChartOptions(`Today's Productivity (${formatDateForDisplay(today)})`)
      });
    } catch (error) {
      console.error("Chart creation error:", error);
      showError("Failed to display charts");
    }
  }

  // Helper function to create chart datasets
  function createDataset(label, data, rgb) {
    return {
      label,
      data,
      backgroundColor: `rgba(${rgb}, 0.7)`,
      borderColor: `rgba(${rgb}, 1)`,
      borderWidth: 1
    };
  }

  // Helper function for bar chart options
  function getBarChartOptions(title) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: title,
          font: { size: 16 }
        },
        tooltip: {
          callbacks: {
            label: (context) => `${context.dataset.label}: ${formatTime(context.raw)}`
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          grid: { display: false }
        },
        y: {
          stacked: true,
          beginAtZero: true,
          title: {
            display: true,
            text: "Time Spent"
          },
          ticks: {
            callback: (value) => formatTime(value)
          }
        }
      }
    };
  }

  // Helper function for pie chart options
  function getPieChartOptions(title) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: title,
          font: { size: 16 }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = total ? Math.round((context.raw / total) * 100) : 0;
              return `${context.label}: ${formatTime(context.raw)} (${percentage}%)`;
            }
          }
        }
      }
    };
  }

  function renderDomainTable(timeData) {
    const today = getCurrentDate();
    const todayData = timeData[today]?.domains || {};
    
    const domains = Object.entries(todayData)
      .sort((a, b) => b[1].time - a[1].time)
      .slice(0, 10);

    domainTableBody.innerHTML = domains.length ? "" : `
      <tr>
        <td colspan="3" style="text-align:center;padding:20px">
          No browsing data collected yet
        </td>
      </tr>`;

    domains.forEach(([domain, data]) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${domain}</td>
        <td>${formatTime(data.time)}</td>
        <td class="${getProductivityClass(data.productive)}">
          ${getCategoryName(data.productive)}
        </td>`;
      domainTableBody.appendChild(row);
    });
  }

  function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours ? `${hours}h ${minutes}m` : minutes >= 1 ? `${minutes}m` : `${seconds}s`;
  }

  function getCurrentDate() {
    return new Date().toISOString().split("T")[0];
  }

  function formatDateForDisplay(dateString) {
    return new Date(dateString).toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric" 
    });
  }

  function getCategoryName(productive) {
    return productive === true ? "Productive" : 
           productive === false ? "Unproductive" : "Neutral";
  }

  function getProductivityClass(productive) {
    return productive === true ? "productive" : 
           productive === false ? "unproductive" : "neutral";
  }

  function showError(message) {
    const container = document.querySelector(".container");
    if (!container) return;
    
    // Remove existing errors
    const existingError = container.querySelector(".error-message");
    if (existingError) existingError.remove();
    
    // Create new error message
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    container.prepend(errorDiv);
  }
});