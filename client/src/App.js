import { useEffect, useState, useMemo } from "react";
import Chart from "react-apexcharts";
import Navbar from "./Components/Navbar";
const stocksUrl = "https://yahoo-finance-api.vercel.app/TSLA";
async function getStocks() {
  const response = await fetch(stocksUrl);
  return response.json();
}

const chart = {
  options: {
    chart: {
      type: "candlestick",
      height: 350,
    },
    title: {
      text: "CandleStick Chart",
      align: "left",
    },
    xaxis: {
      type: "datetime",
    },
    yaxis: {
      tooltip: {
        enabled: true,
      },
    },
  },
};

const round = (number) => {
  return number ? +number.toFixed(2) : null;
};

function App() {
  const [series, setSeries] = useState([
    {
      data: [],
    },
  ]);
  const [price, setPrice] = useState(-1);
  const [prevPrice, setPrevPrice] = useState(-1);
  const [priceTime, setPriceTime] = useState(null);

  useEffect(() => {
    let timeoutId;
    async function getLatestPrice() {
      try {
        const data = await getStocks();
        console.log(data);
        const tsla = data.chart.result[0];
        setPrevPrice(price);
        setPrice(tsla.meta.regularMarketPrice.toFixed(2));
        setPriceTime(new Date(tsla.meta.regularMarketTime * 1000));
        const quote = tsla.indicators.quote[0];
        const prices = tsla.timestamp.map((timestamp, index) => ({
          x: new Date(timestamp * 1000),
          y: [
            quote.open[index],
            quote.high[index],
            quote.low[index],
            quote.close[index],
          ].map(round),
        }));
        setSeries([
          {
            data: prices,
          },
        ]);
      } catch (error) {
        console.log(error);
      }
      timeoutId = setTimeout(getLatestPrice, 5000 * 2);
    }

    getLatestPrice();

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  const direction = useMemo(
    () => (prevPrice < price ? "up" : prevPrice > price ? "down" : ""),
    [prevPrice, price]
  );

  return (
    <div>
      <Navbar />
      <div className="ticker">TSLA</div>
      <div className={["price", direction].join(" ")}>${price}</div>
      <div className="price-time">
        {priceTime && priceTime.toLocaleTimeString()}
      </div>
      <Chart
        options={chart.options}
        series={series}
        type="candlestick"
        width="90%"
        height={300}
        align="center"
      />
    </div>
  );
}

export default App;
