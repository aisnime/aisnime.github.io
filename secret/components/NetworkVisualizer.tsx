import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { NetworkNode } from '../types';
import { Globe, MapPin, Loader2 } from 'lucide-react';

interface Props {
  nodes: NetworkNode[];
}

const NetworkVisualizer: React.FC<Props> = ({ nodes }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [worldData, setWorldData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch World Map Data
  useEffect(() => {
    d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then((data: any) => {
        setWorldData(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to load map data", err);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!svgRef.current || !wrapperRef.current || !worldData) return;

    const width = wrapperRef.current.clientWidth;
    const height = wrapperRef.current.clientHeight;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear

    svg
      .attr("viewBox", [0, 0, width, height])
      .style("background-color", "transparent");

    // Projection (Mercator for flat map)
    const projection = d3.geoMercator()
      .fitSize([width, height], topojson.feature(worldData, worldData.objects.countries) as any)
      .translate([width / 2, height / 1.6]); // Slight adjustment to center visually

    const path = d3.geoPath().projection(projection);

    // Draw Map (Landmass)
    const countries = topojson.feature(worldData, worldData.objects.countries) as any;
    
    // Glow filter defs
    const defs = svg.append("defs");
    const filter = defs.append("filter")
        .attr("id", "glow")
    filter.append("feGaussianBlur")
        .attr("stdDeviation", "2.5")
        .attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Draw Countries
    svg.append("g")
      .selectAll("path")
      .data(countries.features)
      .enter().append("path")
      .attr("d", path as any)
      .attr("fill", "#1e293b") // cyber-700
      .attr("stroke", "#334155") // cyber-600
      .attr("stroke-width", 0.5);

    // --- Draw Links (Mesh Connections) ---
    // Create random connections for simulation visual
    const links: any[] = [];
    if (nodes.length > 1) {
      // Connect each node to 1-2 other random nodes to form a mesh
      nodes.forEach((source, i) => {
        // Always connect to at least one other node if available
        if (i < nodes.length - 1) {
          links.push({ source, target: nodes[i + 1] });
        }
        // Random extra connection
        if (Math.random() > 0.5 && nodes.length > 2) {
           const targetIndex = Math.floor(Math.random() * nodes.length);
           if (targetIndex !== i) {
             links.push({ source, target: nodes[targetIndex] });
           }
        }
      });
    }

    svg.append("g")
      .selectAll("path")
      .data(links)
      .enter().append("path")
      .attr("d", (d: any) => {
        const sourceCoords = projection([d.source.lng, d.source.lat]);
        const targetCoords = projection([d.target.lng, d.target.lat]);
        if (!sourceCoords || !targetCoords) return "";
        
        // Curve logic
        const dx = targetCoords[0] - sourceCoords[0],
              dy = targetCoords[1] - sourceCoords[1],
              dr = Math.sqrt(dx * dx + dy * dy);
        return `M${sourceCoords[0]},${sourceCoords[1]}A${dr},${dr} 0 0,1 ${targetCoords[0]},${targetCoords[1]}`;
      })
      .attr("fill", "none")
      .attr("stroke", "#06b6d4") // Cyber Cyan
      .attr("stroke-width", 1)
      .attr("stroke-opacity", 0.4)
      .attr("class", "animate-dash"); // Requires CSS animation if we want flow

    // --- Draw Nodes ---
    const nodeGroup = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .enter().append("g")
      .attr("transform", (d) => {
        const coords = projection([d.lng, d.lat]);
        return coords ? `translate(${coords[0]}, ${coords[1]})` : "translate(0,0)";
      });

    // Pulse Ring
    nodeGroup.append("circle")
      .attr("r", 8)
      .attr("fill", "none")
      .attr("stroke", (d) => d.status === 'Aktif' ? "#10b981" : "#ef4444")
      .attr("stroke-opacity", 0.5)
      .attr("stroke-width", 1)
      .append("animate") // Native SVG animation
        .attr("attributeName", "r")
        .attr("from", "4")
        .attr("to", "12")
        .attr("dur", "1.5s")
        .attr("repeatCount", "indefinite");
        
    nodeGroup.select("animate")
        .append("animate")
        .attr("attributeName", "opacity")
        .attr("from", "0.8")
        .attr("to", "0")
        .attr("dur", "1.5s")
        .attr("repeatCount", "indefinite");

    // Core Dot
    nodeGroup.append("circle")
      .attr("r", 3)
      .attr("fill", (d) => d.status === 'Aktif' ? "#10b981" : "#ef4444") // Emerald or Red
      .attr("filter", "url(#glow)");

    // Labels (City Name)
    nodeGroup.append("text")
      .text((d) => d.location ? d.location.split(',')[0] : d.id.substring(0,4))
      .attr("y", -8)
      .attr("text-anchor", "middle")
      .attr("fill", "#cbd5e1")
      .attr("font-size", "8px")
      .attr("font-family", "monospace")
      .style("text-shadow", "2px 2px 4px #000");

  }, [nodes, worldData]);

  return (
    <div ref={wrapperRef} className="w-full h-full min-h-[400px] bg-cyber-900 rounded-lg shadow-inner border border-cyber-600 overflow-hidden relative">
      
      {/* Overlay Header */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h3 className="text-cyber-primary font-mono text-sm font-bold uppercase tracking-wider flex items-center gap-2 shadow-black drop-shadow-md">
          <Globe size={16} />
          Global Mesh Map
        </h3>
        <p className="text-[10px] text-cyber-500 mt-1 bg-black/50 px-2 py-1 rounded backdrop-blur-sm border border-white/10 inline-block">
          Live Geo-Spatial Topology
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center text-cyber-primary">
          <Loader2 className="animate-spin mr-2" />
          <span className="text-xs font-mono">Loading Topography...</span>
        </div>
      )}

      {/* Map Container */}
      <svg ref={svgRef} className="w-full h-full block pointer-events-none"></svg>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2 pointer-events-none">
         <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded border border-cyber-700 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]"></span>
            <span className="text-[10px] text-gray-300 font-mono">SECURE NODE</span>
         </div>
         <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded border border-cyber-700 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_#ef4444] animate-pulse"></span>
            <span className="text-[10px] text-gray-300 font-mono">MALWARE DETECTED</span>
         </div>
      </div>
    </div>
  );
};

export default NetworkVisualizer;