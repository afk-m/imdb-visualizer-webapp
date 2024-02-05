import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const DataVisualization = ({ title, data, visualizationType, isDarkMode }) => {
    const d3Container = useRef(null);

    useEffect(() => {
        const margin = { top: 40, right: 30, bottom: 60, left: 60 },
        svgWidth = 960,
        svgHeight = 500,
        width = svgWidth - margin.left - margin.right,
        height = svgHeight - margin.top - margin.bottom;
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const {width} = entry.contentRect;
                // Adjust heatmap dimensions based on 'width'
                // You might want to maintain a specific aspect ratio or calculate the height dynamically
                const newHeatmapWidth = width - margin.left - margin.right;
                // Update the scales and redraw the heatmap
            }
        });
        if (data && d3Container.current) {
            resizeObserver.observe(d3Container.current.parentNode); 
            const svg = d3.select(d3Container.current);
            svg.selectAll("*").remove(); // Clear SVG

            svg.attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);

            const textColor = isDarkMode ? '#fff' : '#000';

            const chart = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

            // different visualization types
            if (visualizationType === "lineGraph") {
                const x = d3.scaleLinear()
                    .domain(d3.extent(data, d => d[2])) // cumulativeEpisodeNumber
                    .range([ 0, width ]);

                let minRating = d3.min(data, d => d[5]) - 0.5; // ratingValue minus 0.5
                let maxRating = d3.max(data, d => d[5]) + 0.5; // ratingValue plus 0.5

                if (maxRating - minRating > 10) {
                    const midPoint = minRating + 0.5 * (maxRating - minRating);
                    minRating = midPoint - 5;
                    maxRating = midPoint + 5;
                }

                const y = d3.scaleLinear()
                    .domain([minRating, maxRating])
                    .range([ height, 0 ]);


                chart.append("path")
                    .datum(data)
                    .attr("fill", "none")
                    .attr("stroke", "steelblue")
                    .attr("stroke-width", 2)
                    .attr("d", d3.line()
                        .x(d => x(d[2]))
                        .y(d => y(d[5])));


                chart.append("text")
                    .attr("x", width / 2)
                    .attr("y", height + margin.top + 40) // Adjust the '40' value as needed for proper positioning
                    .style("text-anchor", "middle")
                    .style("font-size", "14px")
                    .text("Episode");

                chart.append("text")
                    .attr("x", -height / 2)
                    .attr("y", -margin.left + 20) // Adjust the '20' value as needed for proper positioning
                    .style("text-anchor", "middle")
                    .style("font-size", "14px")
                    .attr("transform", "rotate(-90)")
                    .text("Rating");

                chart.append("g")
                    .attr("transform", `translate(0, ${height})`)
                    .call(d3.axisBottom(x));

                chart.append("g")
                    .call(d3.axisLeft(y));
            } else if (visualizationType === "barChart") {
                const seasonRatings = d3.rollups(data, v => d3.mean(v, d => d[5]), d => d[0]);
                const x = d3.scaleBand()
                    .domain(seasonRatings.map(d => d[0]))
                    .range([0, width])
                    .padding(0.1);

                const y = d3.scaleLinear()
                    .domain([0, d3.max(seasonRatings, d => d[1])])
                    .range([height, 0]);

                chart.selectAll(".text")
                    .data(seasonRatings)
                    .enter().append("text")
                    .attr("class", "label")
                    .attr("x", (d) => x(d[0]) + x.bandwidth() / 2)
                    .attr("y", (d) => y(d[1]) - 5)
                    .attr("text-anchor", "middle")
                    .text((d) => d[1].toFixed(2)); // Format to 2 decimal places

                chart.selectAll(".bar")
                    .data(seasonRatings)
                    .enter().append("rect")
                    .attr("x", d => x(d[0]))
                    .attr("y", d => y(d[1]))
                    .attr("width", x.bandwidth())
                    .attr("height", d => height - y(d[1]))
                    .attr("fill", "steelblue");

                chart.append("text")
                    .attr("x", width / 2)
                    .attr("y", height + margin.top + 40) // Adjust the '40' value as needed for proper positioning
                    .style("text-anchor", "middle")
                    .style("font-size", "14px")
                    .text("Season");

                chart.append("text")
                    .attr("x", -height / 2)
                    .attr("y", -margin.left + 20) // Adjust the '20' value as needed for proper positioning
                    .style("text-anchor", "middle")
                    .style("font-size", "14px")
                    .attr("transform", "rotate(-90)")
                    .text("Rating");

                chart.append("g")
                    .attr("transform", `translate(0, ${height})`)
                    .call(d3.axisBottom(x));

                chart.append("g")
                    .call(d3.axisLeft(y));
            } else if (visualizationType === "areaChart") {
       
                const seasons = [...new Set(data.map(d => d[0]))];
                const episodesPerSeason = d3.max(data, d => d[1]);
                const heatmapWidth = episodesPerSeason * 60;
                const heatmapHeight = seasons.length * 60;

                svg.attr("viewBox", `0 0 ${heatmapWidth + margin.left + margin.right} ${heatmapHeight + margin.top + margin.bottom}`)
                    .style("width", "100%")
                    .style("height", "auto");

                const chart = svg.append("g")
                        .attr("transform", `translate(${margin.left},${margin.top})`);

                // Define the scales
                const x = d3.scaleBand()
                    .domain(d3.range(1, episodesPerSeason + 1))
                    .range([0, heatmapWidth])
                    .padding(0.1);

                const y = d3.scaleBand()
                    .domain(seasons.map(season => `Season ${season}`))
                    .range([0, heatmapHeight])
                    .padding(0.1);

                const colorScale = d3.scaleSequential()
                    .interpolator(d3.interpolateInferno)
                    .domain(d3.extent(data, d => d[5]));

                // Drawing the heatmap squares
                data.forEach(d => {
                    chart.append("rect")
                        .attr("x", x(d[1]))
                        .attr("y", y(`Season ${d[0]}`))
                        .attr("width", x.bandwidth())
                        .attr("height", y.bandwidth())
                        .style("fill", colorScale(d[5]))
                        .append("title") // Tooltip showing the rating
                        .text(`S${d[0]}E${d[1]}: ${d[5]} Rating`);
                });

                // Adding text labels over each square
                data.forEach(d => {
                    chart.append("text")
                        .attr("x", x(d[1]) + x.bandwidth() / 2)
                        .attr("y", y(`Season ${d[0]}`) + y.bandwidth() / 2)
                        .attr("dy", ".35em")
                        .attr("text-anchor", "Middle")
                        .text(d[5])
                        .style("stroke", "#000000")
                        .style("stroke-width", "0.5px") 
                        .style("fill", "#FFFFFF");
                });

                chart.append("g")
                    .attr("transform", `translate(0, ${heatmapHeight})`)
                    .call(d3.axisBottom(x).tickFormat(i => `E${i}`));

                chart.append("g")
                    .call(d3.axisLeft(y));
            }

            svg.append("text")
                .attr('fill', textColor)
                .attr("x", svgWidth / 2)
                .attr("y", margin.top / 2) 
                .attr("text-anchor", "middle")
                .style("font-size", "20px")
                .text(title);
        }
        return () => resizeObserver.disconnect(); 
    }, [title, data, visualizationType, isDarkMode]);

    return <svg className="d3-component" ref={d3Container}/>;
};

export default DataVisualization;
