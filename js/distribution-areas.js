(function () {
    'use strict';

    const SVG_NS = 'http://www.w3.org/2000/svg';
    const MAP_WIDTH = 1000;
    const MAP_HEIGHT = 500;

    const AREA_TYPES = {
        actual: { label: 'Ocorrência actual', color: '#ef4444' },
        historica: { label: 'Área histórica', color: '#f59e0b' },
        reintroducao: { label: 'Reintrodução', color: '#22c55e' },
        migracao: { label: 'Migração', color: '#8b5cf6' }
    };

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, Number(value) || 0));
    }

    function normalizePoints(value) {
        if (!Array.isArray(value)) return [];
        return value
            .map(point => {
                if (Array.isArray(point)) return [clamp(point[0], 0, MAP_WIDTH), clamp(point[1], 0, MAP_HEIGHT)];
                if (point && typeof point === 'object') {
                    return [clamp(point.x, 0, MAP_WIDTH), clamp(point.y, 0, MAP_HEIGHT)];
                }
                return null;
            })
            .filter(point => point !== null);
    }

    function normalizeDistributionAreas(value) {
        if (!Array.isArray(value)) return [];
        return value.map((area, index) => {
            if (!area || typeof area !== 'object') return null;
            const points = normalizePoints(area.pontos || area.points || area.coordenadas);
            if (points.length < 3) return null;
            const type = AREA_TYPES[area.tipo] ? area.tipo : 'actual';
            return {
                id: String(area.id || `area-${index + 1}`),
                nome: String(area.nome || AREA_TYPES[type].label),
                tipo: type,
                pontos: points
            };
        }).filter(Boolean);
    }

    function normalizeDistributionPoints(value) {
        if (!Array.isArray(value)) return [];
        return value.map((point, index) => {
            if (!point || typeof point !== 'object') return null;
            const rawPoint = point.ponto || point.point || point.coordenada || point.coordinates;
            const normalizedPoint = normalizePoints([rawPoint])[0];
            if (!normalizedPoint) return null;
            const type = AREA_TYPES[point.tipo] ? point.tipo : 'actual';
            return {
                id: String(point.id || `point-${index + 1}`),
                nome: String(point.nome || `Ponto ${index + 1}`),
                tipo: type,
                ponto: normalizedPoint
            };
        }).filter(Boolean);
    }

    function getDistributionAreaTypeOptions(selected) {
        return Object.entries(AREA_TYPES)
            .map(([value, item]) => `<option value="${value}"${value === selected ? ' selected' : ''}>${item.label}</option>`)
            .join('');
    }

    function getDistributionAreaColor(type) {
        return AREA_TYPES[type]?.color || AREA_TYPES.actual.color;
    }

    function pointInPolygon(point, polygon) {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i][0], yi = polygon[i][1];
            const xj = polygon[j][0], yj = polygon[j][1];
            const intersects = ((yi > point[1]) !== (yj > point[1])) &&
                (point[0] < ((xj - xi) * (point[1] - yi)) / ((yj - yi) || Number.EPSILON) + xi);
            if (intersects) inside = !inside;
        }
        return inside;
    }

    function getMapSvg(container) {
        return container?.querySelector('svg') || null;
    }

    function getMapCoordinateLayer(svg) {
        return svg?.querySelector('#jvm-regions-group') ||
            svg?.querySelector('g.jvm-zoomable') ||
            svg;
    }

    function parseViewBox(svg) {
        const raw = (svg.getAttribute('viewBox') || '').trim().split(/[ ,]+/).map(Number);
        if (raw.length === 4 && raw.every(Number.isFinite)) {
            return { x: raw[0], y: raw[1], width: raw[2], height: raw[3] };
        }
        return { x: 0, y: 0, width: MAP_WIDTH, height: MAP_HEIGHT };
    }

    function normalizedToLayerPoint(point, bounds) {
        return {
            x: bounds.x + (point[0] / MAP_WIDTH) * bounds.width,
            y: bounds.y + (point[1] / MAP_HEIGHT) * bounds.height
        };
    }

    function pathPointToLayer(path, localPoint, coordinateLayer) {
        if (path.parentNode === coordinateLayer && !path.hasAttribute('transform')) return localPoint;
        if (!path.getScreenCTM || !coordinateLayer.getScreenCTM) return localPoint;
        const pathMatrix = path.getScreenCTM();
        const layerMatrix = coordinateLayer.getScreenCTM();
        if (!pathMatrix || !layerMatrix) return localPoint;
        const screenPoint = localPoint.matrixTransform(pathMatrix);
        return screenPoint.matrixTransform(layerMatrix.inverse());
    }

    function layerPointToPathLocal(layerPoint, path, coordinateLayer) {
        if (path.parentNode === coordinateLayer && !path.hasAttribute('transform')) return layerPoint;
        if (!path.getScreenCTM || !coordinateLayer.getScreenCTM) return layerPoint;
        const pathMatrix = path.getScreenCTM();
        const layerMatrix = coordinateLayer.getScreenCTM();
        if (!pathMatrix || !layerMatrix) return layerPoint;
        const screenPoint = layerPoint.matrixTransform(layerMatrix);
        return screenPoint.matrixTransform(pathMatrix.inverse());
    }

    function getGeographyBounds(svg, coordinateLayer) {
        const countryPaths = Array.from(svg.querySelectorAll('path[data-code]'));
        const coordinates = [];

        countryPaths.forEach(path => {
            try {
                const box = path.getBBox();
                [
                    [box.x, box.y],
                    [box.x + box.width, box.y],
                    [box.x + box.width, box.y + box.height],
                    [box.x, box.y + box.height]
                ].forEach(([x, y]) => {
                    const localPoint = svg.createSVGPoint();
                    localPoint.x = x;
                    localPoint.y = y;
                    const layerPoint = pathPointToLayer(path, localPoint, coordinateLayer);
                    if (Number.isFinite(layerPoint.x) && Number.isFinite(layerPoint.y)) {
                        coordinates.push([layerPoint.x, layerPoint.y]);
                    }
                });
            } catch (error) {
                // Durante o primeiro render, alguns browsers ainda não expõem getBBox.
            }
        });

        if (!coordinates.length) return parseViewBox(svg);

        const xs = coordinates.map(point => point[0]);
        const ys = coordinates.map(point => point[1]);
        const x = Math.min(...xs);
        const y = Math.min(...ys);
        const width = Math.max(...xs) - x;
        const height = Math.max(...ys) - y;

        return width > 0 && height > 0
            ? { x, y, width, height }
            : parseViewBox(svg);
    }

    function getCountryPathPoints(path, svg, coordinateLayer) {
        const points = [];
        try {
            const length = path.getTotalLength();
            const samples = Math.min(160, Math.max(32, Math.ceil(length / 8)));
            for (let index = 0; index <= samples; index++) {
                const localPoint = path.getPointAtLength((length * index) / samples);
                const layerPoint = pathPointToLayer(path, localPoint, coordinateLayer);
                points.push([layerPoint.x, layerPoint.y]);
            }
        } catch (error) {
            // O teste de preenchimento abaixo continua a funcionar sem amostragem.
        }
        return points;
    }

    function pathContainsLayerPoint(path, layerPoint, coordinateLayer) {
        if (typeof path.isPointInFill !== 'function') return false;
        try {
            return path.isPointInFill(layerPointToPathLocal(layerPoint, path, coordinateLayer));
        } catch (error) {
            return false;
        }
    }

    function getCountriesCoveredByArea(container, points) {
        const svg = getMapSvg(container);
        if (!svg || !Array.isArray(points) || points.length < 3) return [];

        const mapLayer = getMapCoordinateLayer(svg);
        const geographyBounds = getGeographyBounds(svg, mapLayer);
        const polygon = points.map(point => {
            const layerPoint = normalizedToLayerPoint(point, geographyBounds);
            return [layerPoint.x, layerPoint.y];
        });
        const coveredCodes = [];
        const countryPaths = Array.from(svg.querySelectorAll('path[data-code]'));

        countryPaths.forEach(path => {
            const code = String(path.getAttribute('data-code') || '').toUpperCase();
            if (!code) return;

            const countryPoints = getCountryPathPoints(path, svg, mapLayer);
            const touchesPolygon = countryPoints.some(point => pointInPolygon(point, polygon));
            const containsPolygonVertex = polygon.some(([x, y]) => {
                const layerPoint = svg.createSVGPoint();
                layerPoint.x = x;
                layerPoint.y = y;
                return pathContainsLayerPoint(path, layerPoint, mapLayer);
            });

            if (touchesPolygon || containsPolygonVertex) coveredCodes.push(code);
        });

        return [...new Set(coveredCodes)];
    }

    function pointsToPath(points, bounds) {
        return points.map((point, index) => {
            const x = bounds.x + (point[0] / MAP_WIDTH) * bounds.width;
            const y = bounds.y + (point[1] / MAP_HEIGHT) * bounds.height;
            return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
        }).join(' ') + ' Z';
    }

    function focusDistributionGeometry(map, container, areas = [], points = [], options = {}) {
        const svg = getMapSvg(container);
        if (!svg || !map || typeof map._setScale !== 'function') return false;

        const mapLayer = getMapCoordinateLayer(svg);
        const geographyBounds = getGeographyBounds(svg, mapLayer);
        const layerPoints = [];

        normalizeDistributionAreas(areas).forEach(area => {
            area.pontos.forEach(point => layerPoints.push(normalizedToLayerPoint(point, geographyBounds)));
        });
        normalizeDistributionPoints(points).forEach(point => {
            layerPoints.push(normalizedToLayerPoint(point.ponto, geographyBounds));
        });

        if (!layerPoints.length) return false;

        const xs = layerPoints.map(point => point.x);
        const ys = layerPoints.map(point => point.y);
        const centreX = (Math.min(...xs) + Math.max(...xs)) / 2;
        const centreY = (Math.min(...ys) + Math.max(...ys)) / 2;
        const minimumSpanRatio = Number(options.minimumSpanRatio) || 0.12;
        const width = Math.max(Math.max(...xs) - Math.min(...xs), geographyBounds.width * minimumSpanRatio);
        const height = Math.max(Math.max(...ys) - Math.min(...ys), geographyBounds.height * minimumSpanRatio);
        const padding = Math.max(0, Number(options.padding) || 0.3);
        const containerWidth = Number(map._width) || container.offsetWidth;
        const containerHeight = Number(map._height) || container.offsetHeight;
        if (!containerWidth || !containerHeight) return false;

        let scale = Math.min(
            containerWidth / (width * (1 + padding)),
            containerHeight / (height * (1 + padding))
        );
        const baseScale = Number(map._baseScale) || 1;
        const maximumScale = baseScale * (Number(options.maximumZoom) || 7);
        scale = Math.min(scale, maximumScale);

        map._setScale(scale, -centreX, -centreY, true, options.animate === true);
        return true;
    }

    function createDistributionAreaOverlay(container, options = {}) {
        const svg = container?.querySelector('svg');
        if (!svg) return null;

        // O jsVectorMap aplica zoom e deslocação a `#jvm-regions-group`.
        // A geometria tem de viver nesse mesmo grupo para ficar presa ao mapa.
        const mapLayer = getMapCoordinateLayer(svg);
        const geographyBounds = getGeographyBounds(svg, mapLayer);
        let overlay = mapLayer.querySelector('g[data-distribution-area-overlay]');
        if (!overlay) {
            overlay = document.createElementNS(SVG_NS, 'g');
            overlay.setAttribute('data-distribution-area-overlay', 'true');
            overlay.setAttribute('aria-hidden', 'true');
            mapLayer.appendChild(overlay);
        }

        // A superfície de desenho fica acima do SVG inteiro para capturar os
        // cliques antes dos países do jsVectorMap.
        svg.querySelectorAll('rect[data-distribution-area-surface]').forEach(node => node.remove());
        let surface = container.querySelector('[data-distribution-area-surface]');
        if (!surface) {
            if (window.getComputedStyle(container).position === 'static') {
                container.style.position = 'relative';
            }
            surface = document.createElement('div');
            surface.setAttribute('data-distribution-area-surface', 'true');
            surface.setAttribute('aria-hidden', 'true');
            surface.style.position = 'absolute';
            surface.style.inset = '0';
            surface.style.zIndex = '40';
            surface.style.background = 'transparent';
            surface.style.userSelect = 'none';
            surface.style.touchAction = 'none';
            container.appendChild(surface);
        }

        let drawing = false;

        function getLayerScale() {
            const transform = mapLayer.getAttribute?.('transform') || '';
            const match = transform.match(/scale\(\s*([\d.+-eE]+)/);
            const scale = Number(match?.[1]);
            return Number.isFinite(scale) && scale > 0 ? scale : 1;
        }

        function updateFixedMarkerScale() {
            const inverseScale = 1 / getLayerScale();
            overlay.querySelectorAll('[data-fixed-map-marker]').forEach(marker => {
                const x = Number(marker.getAttribute('data-layer-x')) || 0;
                const y = Number(marker.getAttribute('data-layer-y')) || 0;
                marker.setAttribute('transform', `translate(${x} ${y}) scale(${inverseScale})`);
            });
        }

        const transformObserver = typeof MutationObserver === 'function'
            ? new MutationObserver(updateFixedMarkerScale)
            : null;
        transformObserver?.observe(mapLayer, { attributes: true, attributeFilter: ['transform'] });

        function toNormalizedPoint(event) {
            if (!svg.createSVGPoint || !mapLayer.getScreenCTM) return null;
            const layerMatrix = mapLayer.getScreenCTM();
            if (!layerMatrix) return null;
            const screenPoint = svg.createSVGPoint();
            screenPoint.x = event.clientX;
            screenPoint.y = event.clientY;
            const localPoint = screenPoint.matrixTransform(layerMatrix.inverse());

            return [
                clamp(((localPoint.x - geographyBounds.x) / geographyBounds.width) * MAP_WIDTH, 0, MAP_WIDTH),
                clamp(((localPoint.y - geographyBounds.y) / geographyBounds.height) * MAP_HEIGHT, 0, MAP_HEIGHT)
            ];
        }

        function stopDrawingInteraction(event) {
            if (!drawing) return;
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation?.();
        }

        ['pointerdown', 'pointermove', 'pointerup'].forEach(eventName => {
            surface.addEventListener(eventName, stopDrawingInteraction, true);
        });

        surface.addEventListener('wheel', event => {
            if (!drawing) return;
            stopDrawingInteraction(event);
            options.onWheel?.(event);
        }, true);

        surface.addEventListener('click', event => {
            if (!drawing || typeof options.onPoint !== 'function') return;
            stopDrawingInteraction(event);
            const point = toNormalizedPoint(event);
            if (point) options.onPoint(point);
        }, true);

        function render(areas = [], draftPoints = [], points = []) {
            overlay.querySelectorAll('[data-area-shape], [data-area-point], [data-area-draft], [data-area-point-marker]').forEach(node => node.remove());

            normalizeDistributionAreas(areas).forEach(area => {
                const path = document.createElementNS(SVG_NS, 'path');
                path.setAttribute('data-area-shape', area.id);
                path.setAttribute('d', pointsToPath(area.pontos, geographyBounds));
                path.setAttribute('fill', getDistributionAreaColor(area.tipo));
                path.setAttribute('fill-opacity', '0.5');
                path.setAttribute('stroke', getDistributionAreaColor(area.tipo));
                path.setAttribute('stroke-width', '2');
                path.setAttribute('stroke-linejoin', 'round');
                path.setAttribute('vector-effect', 'non-scaling-stroke');
                path.style.pointerEvents = 'none';
                overlay.appendChild(path);
            });

            if (draftPoints.length > 0) {
                const draft = document.createElementNS(SVG_NS, 'path');
                draft.setAttribute('data-area-draft', 'true');
                draft.setAttribute('d', pointsToPath(draftPoints, geographyBounds));
                draft.setAttribute('fill', '#ef4444');
                draft.setAttribute('fill-opacity', '0.18');
                draft.setAttribute('stroke', '#ffffff');
                draft.setAttribute('stroke-width', '2');
                draft.setAttribute('stroke-dasharray', '6 4');
                draft.setAttribute('stroke-linejoin', 'round');
                draft.setAttribute('vector-effect', 'non-scaling-stroke');
                draft.style.pointerEvents = 'none';
                overlay.appendChild(draft);

                draftPoints.forEach(point => {
                    const layerPoint = normalizedToLayerPoint(point, geographyBounds);
                    const marker = document.createElementNS(SVG_NS, 'g');
                    marker.setAttribute('data-area-point', 'true');
                    marker.setAttribute('data-fixed-map-marker', 'true');
                    marker.setAttribute('data-layer-x', layerPoint.x);
                    marker.setAttribute('data-layer-y', layerPoint.y);

                    const circle = document.createElementNS(SVG_NS, 'circle');
                    circle.setAttribute('cx', '0');
                    circle.setAttribute('cy', '0');
                    circle.setAttribute('r', '2.4');
                    circle.setAttribute('fill', '#ffffff');
                    circle.setAttribute('stroke', '#ef4444');
                    circle.setAttribute('stroke-width', '2');
                    circle.style.pointerEvents = 'none';
                    marker.appendChild(circle);
                    overlay.appendChild(marker);
                });
            }

            normalizeDistributionPoints(points).forEach(pointData => {
                const point = normalizedToLayerPoint(pointData.ponto, geographyBounds);
                const marker = document.createElementNS(SVG_NS, 'g');
                marker.setAttribute('data-area-point-marker', pointData.id);
                marker.setAttribute('data-fixed-map-marker', 'true');
                marker.setAttribute('data-layer-x', point.x);
                marker.setAttribute('data-layer-y', point.y);
                marker.style.pointerEvents = 'none';

                const halo = document.createElementNS(SVG_NS, 'circle');
                halo.setAttribute('cx', '0');
                halo.setAttribute('cy', '0');
                halo.setAttribute('r', '4.2');
                halo.setAttribute('fill', getDistributionAreaColor(pointData.tipo));
                halo.setAttribute('fill-opacity', '0.24');

                const dot = document.createElementNS(SVG_NS, 'circle');
                dot.setAttribute('cx', '0');
                dot.setAttribute('cy', '0');
                dot.setAttribute('r', '2.1');
                dot.setAttribute('fill', getDistributionAreaColor(pointData.tipo));
                dot.setAttribute('stroke', '#ffffff');
                dot.setAttribute('stroke-width', '1.5');
                dot.setAttribute('vector-effect', 'non-scaling-stroke');

                marker.append(halo, dot);
                overlay.appendChild(marker);
            });

            updateFixedMarkerScale();
        }

        function setDrawing(value) {
            drawing = Boolean(value);
            surface.style.pointerEvents = drawing ? 'all' : 'none';
            surface.style.cursor = drawing ? 'crosshair' : 'default';
        }

        setDrawing(Boolean(options.drawMode));
        render(options.areas || [], options.draftPoints || [], options.points || []);

        return { render, setDrawing, geographyBounds };
    }

    window.DistributionAreas = {
        AREA_TYPES,
        getDistributionAreaColor,
        getDistributionAreaTypeOptions,
        getCountriesCoveredByArea,
        normalizeDistributionAreas,
        normalizeDistributionPoints,
        focusDistributionGeometry,
        createDistributionAreaOverlay
    };
})();
