import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import styles from "./NepalMap.module.css";

const COLOR_STOPS = [
  "#f0eafb", "#c0aaf0", "#9f84e8",
  "#7f77dd", "#534ab7", "#3c3489",
];
const colorScale = d3.scaleQuantize([60, 100], COLOR_STOPS);

export default function NepalMap({ coverageData, onDistrictClick, selectedDistrict }) {
  const svgRef = useRef(null);
  const wrapRef = useRef(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, name: "", coverage: 0, imr: "" });
  const [features, setFeatures] = useState([]);
  const [mapReady, setMapReady] = useState(false);

  // Build a lookup map: district_name -> record
  const dataMap = {};
  (coverageData || []).forEach((d) => {
    if (d.district_name) dataMap[d.district_name.toLowerCase()] = d;
  });

  // Load TopoJSON once
  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/gh/mesaugat/geoJSON-Nepal@master/nepal-districts.topojson")
      .then((r) => r.json())
      .then((topo) => {
        const feats = topojson.feature(topo, topo.objects.nepal).features;
        setFeatures(feats);
        setMapReady(true);
      })
      .catch(console.error);
  }, []);

  // Draw / redraw whenever features or data changes
  useEffect(() => {
    if (!mapReady || !svgRef.current || !wrapRef.current) return;

    const wrap = wrapRef.current;
    const W = wrap.clientWidth || 560;
    const H = Math.round(W * 0.5);

    const svg = d3.select(svgRef.current);
    svg.attr("viewBox", `0 0 ${W} ${H}`).attr("width", "100%");

    const proj = d3
      .geoMercator()
      .fitSize([W, H], { type: "FeatureCollection", features });
    const path = d3.geoPath(proj);

    svg.selectAll("path").remove();

    svg
      .selectAll("path")
      .data(features)
      .join("path")
      .attr("d", path)
      .attr("fill", (d) => {
        const rec = dataMap[d.properties.name?.toLowerCase()];
        return rec ? colorScale(Math.min(rec.coverage_pct ?? 0, 100)) : "#1e1e2e";
      })
      .attr("stroke", "rgba(255,255,255,0.15)")
      .attr("stroke-width", 0.5)
      .attr("class", (d) =>
        d.properties.name?.toLowerCase() === selectedDistrict?.toLowerCase()
          ? styles.pathSelected
          : styles.path
      )
      .on("mousemove", function (event, d) {
        const rec = dataMap[d.properties.name?.toLowerCase()];
        const rect = wrap.getBoundingClientRect();
        setTooltip({
          visible: true,
          x: event.clientX - rect.left + 12,
          y: event.clientY - rect.top - 40,
          name: d.properties.name,
          coverage: rec?.coverage_pct ?? "N/A",
          imr: rec?.imr ?? "",
        });
        d3.select(this).attr("stroke", "#fff").attr("stroke-width", 1.5);
      })
      .on("mouseleave", function (event, d) {
        setTooltip((t) => ({ ...t, visible: false }));
        const isSelected =
          d.properties.name?.toLowerCase() === selectedDistrict?.toLowerCase();
        d3.select(this)
          .attr("stroke", isSelected ? "#9f84e8" : "rgba(255,255,255,0.15)")
          .attr("stroke-width", isSelected ? 2 : 0.5);
      })
      .on("click", (event, d) => {
        onDistrictClick(d.properties.name);
      });

    // Highlight selected
    if (selectedDistrict) {
      svg
        .selectAll("path")
        .filter((d) => d.properties.name?.toLowerCase() === selectedDistrict.toLowerCase())
        .raise()
        .attr("stroke", "#9f84e8")
        .attr("stroke-width", 2);
    }
  }, [features, coverageData, selectedDistrict, mapReady]);

  return (
    <div ref={wrapRef} className={styles.wrap}>
      {!mapReady && (
        <div className={styles.mapPlaceholder}>Loading Nepal district boundaries…</div>
      )}
      <svg ref={svgRef} className={styles.svg} />
      {tooltip.visible && (
        <div
          className={styles.tooltip}
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <strong>{tooltip.name}</strong>
          <span>DPT-3 coverage: {typeof tooltip.coverage === "number" ? tooltip.coverage + "%" : tooltip.coverage}</span>
          {tooltip.imr && (
            <span className={styles.tooltipImr} data-level={tooltip.imr}>
              IMR: {tooltip.imr}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
