(function() {
    !function() {
        var d3 = {
            version: "3.4.4"
        };
        d3.merge = function(arrays) {
            var n = arrays.length, m, i = -1, j = 0, merged, array;
            while (++i < n) j += arrays[i].length;
            merged = new Array(j);
            while (--n >= 0) {
                array = arrays[n];
                m = array.length;
                while (--m >= 0) {
                    merged[--j] = array[m];
                }
            }
            return merged;
        };
        var abs = Math.abs;
        var π = Math.PI, τ = 2 * π, halfπ = π / 2, ε = 1e-6, ε2 = ε * ε, d3_radians = π / 180, d3_degrees = 180 / π;
        function d3_sgn(x) {
            return x > 0 ? 1 : x < 0 ? -1 : 0;
        }
        function d3_cross2d(a, b, c) {
            return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
        }
        function d3_acos(x) {
            return x > 1 ? 0 : x < -1 ? π : Math.acos(x);
        }
        function d3_asin(x) {
            return x > 1 ? halfπ : x < -1 ? -halfπ : Math.asin(x);
        }
        function d3_sinh(x) {
            return ((x = Math.exp(x)) - 1 / x) / 2;
        }
        function d3_cosh(x) {
            return ((x = Math.exp(x)) + 1 / x) / 2;
        }
        function d3_tanh(x) {
            return ((x = Math.exp(2 * x)) - 1) / (x + 1);
        }
        function d3_haversin(x) {
            return (x = Math.sin(x / 2)) * x;
        }
        function d3_geom_clipLine(x0, y0, x1, y1) {
            return function(line) {
                var a = line.a, b = line.b, ax = a.x, ay = a.y, bx = b.x, by = b.y, t0 = 0, t1 = 1, dx = bx - ax, dy = by - ay, r;
                r = x0 - ax;
                if (!dx && r > 0) return;
                r /= dx;
                if (dx < 0) {
                    if (r < t0) return;
                    if (r < t1) t1 = r;
                } else if (dx > 0) {
                    if (r > t1) return;
                    if (r > t0) t0 = r;
                }
                r = x1 - ax;
                if (!dx && r < 0) return;
                r /= dx;
                if (dx < 0) {
                    if (r > t1) return;
                    if (r > t0) t0 = r;
                } else if (dx > 0) {
                    if (r < t0) return;
                    if (r < t1) t1 = r;
                }
                r = y0 - ay;
                if (!dy && r > 0) return;
                r /= dy;
                if (dy < 0) {
                    if (r < t0) return;
                    if (r < t1) t1 = r;
                } else if (dy > 0) {
                    if (r > t1) return;
                    if (r > t0) t0 = r;
                }
                r = y1 - ay;
                if (!dy && r < 0) return;
                r /= dy;
                if (dy < 0) {
                    if (r > t1) return;
                    if (r > t0) t0 = r;
                } else if (dy > 0) {
                    if (r < t0) return;
                    if (r < t1) t1 = r;
                }
                if (t0 > 0) line.a = {
                    x: ax + t0 * dx,
                    y: ay + t0 * dy
                };
                if (t1 < 1) line.b = {
                    x: ax + t1 * dx,
                    y: ay + t1 * dy
                };
                return line;
            };
        }
        d3.geo = {};
        function d3_noop() {}
        function d3_geo_spherical(cartesian) {
            return [ Math.atan2(cartesian[1], cartesian[0]), d3_asin(cartesian[2]) ];
        }
        function d3_geo_sphericalEqual(a, b) {
            return abs(a[0] - b[0]) < ε && abs(a[1] - b[1]) < ε;
        }
        function d3_geo_clipPolygon(segments, compare, clipStartInside, interpolate, listener) {
            var subject = [], clip = [];
            segments.forEach(function(segment) {
                if ((n = segment.length - 1) <= 0) return;
                var n, p0 = segment[0], p1 = segment[n];
                if (d3_geo_sphericalEqual(p0, p1)) {
                    listener.lineStart();
                    for (var i = 0; i < n; ++i) listener.point((p0 = segment[i])[0], p0[1]);
                    listener.lineEnd();
                    return;
                }
                var a = new d3_geo_clipPolygonIntersection(p0, segment, null, true), b = new d3_geo_clipPolygonIntersection(p0, null, a, false);
                a.o = b;
                subject.push(a);
                clip.push(b);
                a = new d3_geo_clipPolygonIntersection(p1, segment, null, false);
                b = new d3_geo_clipPolygonIntersection(p1, null, a, true);
                a.o = b;
                subject.push(a);
                clip.push(b);
            });
            clip.sort(compare);
            d3_geo_clipPolygonLinkCircular(subject);
            d3_geo_clipPolygonLinkCircular(clip);
            if (!subject.length) return;
            for (var i = 0, entry = clipStartInside, n = clip.length; i < n; ++i) {
                clip[i].e = entry = !entry;
            }
            var start = subject[0], points, point;
            while (1) {
                var current = start, isSubject = true;
                while (current.v) if ((current = current.n) === start) return;
                points = current.z;
                listener.lineStart();
                do {
                    current.v = current.o.v = true;
                    if (current.e) {
                        if (isSubject) {
                            for (var i = 0, n = points.length; i < n; ++i) listener.point((point = points[i])[0], point[1]);
                        } else {
                            interpolate(current.x, current.n.x, 1, listener);
                        }
                        current = current.n;
                    } else {
                        if (isSubject) {
                            points = current.p.z;
                            for (var i = points.length - 1; i >= 0; --i) listener.point((point = points[i])[0], point[1]);
                        } else {
                            interpolate(current.x, current.p.x, -1, listener);
                        }
                        current = current.p;
                    }
                    current = current.o;
                    points = current.z;
                    isSubject = !isSubject;
                } while (!current.v);
                listener.lineEnd();
            }
        }
        function d3_geo_clipPolygonLinkCircular(array) {
            if (!(n = array.length)) return;
            var n, i = 0, a = array[0], b;
            while (++i < n) {
                a.n = b = array[i];
                b.p = a;
                a = b;
            }
            a.n = b = array[0];
            b.p = a;
        }
        function d3_geo_clipPolygonIntersection(point, points, other, entry) {
            this.x = point;
            this.z = points;
            this.o = other;
            this.e = entry;
            this.v = false;
            this.n = this.p = null;
        }
        function d3_geo_clip(pointVisible, clipLine, interpolate, clipStart) {
            return function(rotate, listener) {
                var line = clipLine(listener), rotatedClipStart = rotate.invert(clipStart[0], clipStart[1]);
                var clip = {
                    point: point,
                    lineStart: lineStart,
                    lineEnd: lineEnd,
                    polygonStart: function() {
                        clip.point = pointRing;
                        clip.lineStart = ringStart;
                        clip.lineEnd = ringEnd;
                        segments = [];
                        polygon = [];
                        listener.polygonStart();
                    },
                    polygonEnd: function() {
                        clip.point = point;
                        clip.lineStart = lineStart;
                        clip.lineEnd = lineEnd;
                        segments = d3.merge(segments);
                        var clipStartInside = d3_geo_pointInPolygon(rotatedClipStart, polygon);
                        if (segments.length) {
                            d3_geo_clipPolygon(segments, d3_geo_clipSort, clipStartInside, interpolate, listener);
                        } else if (clipStartInside) {
                            listener.lineStart();
                            interpolate(null, null, 1, listener);
                            listener.lineEnd();
                        }
                        listener.polygonEnd();
                        segments = polygon = null;
                    },
                    sphere: function() {
                        listener.polygonStart();
                        listener.lineStart();
                        interpolate(null, null, 1, listener);
                        listener.lineEnd();
                        listener.polygonEnd();
                    }
                };
                function point(λ, φ) {
                    var point = rotate(λ, φ);
                    if (pointVisible(λ = point[0], φ = point[1])) listener.point(λ, φ);
                }
                function pointLine(λ, φ) {
                    var point = rotate(λ, φ);
                    line.point(point[0], point[1]);
                }
                function lineStart() {
                    clip.point = pointLine;
                    line.lineStart();
                }
                function lineEnd() {
                    clip.point = point;
                    line.lineEnd();
                }
                var segments;
                var buffer = d3_geo_clipBufferListener(), ringListener = clipLine(buffer), polygon, ring;
                function pointRing(λ, φ) {
                    ring.push([ λ, φ ]);
                    var point = rotate(λ, φ);
                    ringListener.point(point[0], point[1]);
                }
                function ringStart() {
                    ringListener.lineStart();
                    ring = [];
                }
                function ringEnd() {
                    pointRing(ring[0][0], ring[0][1]);
                    ringListener.lineEnd();
                    var clean = ringListener.clean(), ringSegments = buffer.buffer(), segment, n = ringSegments.length;
                    ring.pop();
                    polygon.push(ring);
                    ring = null;
                    if (!n) return;
                    if (clean & 1) {
                        segment = ringSegments[0];
                        var n = segment.length - 1, i = -1, point;
                        listener.lineStart();
                        while (++i < n) listener.point((point = segment[i])[0], point[1]);
                        listener.lineEnd();
                        return;
                    }
                    if (n > 1 && clean & 2) ringSegments.push(ringSegments.pop().concat(ringSegments.shift()));
                    segments.push(ringSegments.filter(d3_geo_clipSegmentLength1));
                }
                return clip;
            };
        }
        function d3_geo_clipSegmentLength1(segment) {
            return segment.length > 1;
        }
        function d3_geo_clipBufferListener() {
            var lines = [], line;
            return {
                lineStart: function() {
                    lines.push(line = []);
                },
                point: function(λ, φ) {
                    line.push([ λ, φ ]);
                },
                lineEnd: d3_noop,
                buffer: function() {
                    var buffer = lines;
                    lines = [];
                    line = null;
                    return buffer;
                },
                rejoin: function() {
                    if (lines.length > 1) lines.push(lines.pop().concat(lines.shift()));
                }
            };
        }
        function d3_geo_clipSort(a, b) {
            return ((a = a.x)[0] < 0 ? a[1] - halfπ - ε : halfπ - a[1]) - ((b = b.x)[0] < 0 ? b[1] - halfπ - ε : halfπ - b[1]);
        }
        var d3_geo_clipExtentMAX = 1e9;
        d3.geo.clipExtent = function() {
            var x0, y0, x1, y1, stream, clip, clipExtent = {
                stream: function(output) {
                    if (stream) stream.valid = false;
                    stream = clip(output);
                    stream.valid = true;
                    return stream;
                },
                extent: function(_) {
                    if (!arguments.length) return [ [ x0, y0 ], [ x1, y1 ] ];
                    clip = d3_geo_clipExtent(x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1]);
                    if (stream) stream.valid = false, stream = null;
                    return clipExtent;
                }
            };
            return clipExtent.extent([ [ 0, 0 ], [ 960, 500 ] ]);
        };
        function d3_geo_clipExtent(x0, y0, x1, y1) {
            return function(listener) {
                var listener_ = listener, bufferListener = d3_geo_clipBufferListener(), clipLine = d3_geom_clipLine(x0, y0, x1, y1), segments, polygon, ring;
                var clip = {
                    point: point,
                    lineStart: lineStart,
                    lineEnd: lineEnd,
                    polygonStart: function() {
                        listener = bufferListener;
                        segments = [];
                        polygon = [];
                        clean = true;
                    },
                    polygonEnd: function() {
                        listener = listener_;
                        segments = d3.merge(segments);
                        var clipStartInside = insidePolygon([ x0, y1 ]), inside = clean && clipStartInside, visible = segments.length;
                        if (inside || visible) {
                            listener.polygonStart();
                            if (inside) {
                                listener.lineStart();
                                interpolate(null, null, 1, listener);
                                listener.lineEnd();
                            }
                            if (visible) {
                                d3_geo_clipPolygon(segments, compare, clipStartInside, interpolate, listener);
                            }
                            listener.polygonEnd();
                        }
                        segments = polygon = ring = null;
                    }
                };
                function insidePolygon(p) {
                    var wn = 0, n = polygon.length, y = p[1];
                    for (var i = 0; i < n; ++i) {
                        for (var j = 1, v = polygon[i], m = v.length, a = v[0], b; j < m; ++j) {
                            b = v[j];
                            if (a[1] <= y) {
                                if (b[1] > y && d3_cross2d(a, b, p) > 0) ++wn;
                            } else {
                                if (b[1] <= y && d3_cross2d(a, b, p) < 0) --wn;
                            }
                            a = b;
                        }
                    }
                    return wn !== 0;
                }
                function interpolate(from, to, direction, listener) {
                    var a = 0, a1 = 0;
                    if (from == null || (a = corner(from, direction)) !== (a1 = corner(to, direction)) || comparePoints(from, to) < 0 ^ direction > 0) {
                        do {
                            listener.point(a === 0 || a === 3 ? x0 : x1, a > 1 ? y1 : y0);
                        } while ((a = (a + direction + 4) % 4) !== a1);
                    } else {
                        listener.point(to[0], to[1]);
                    }
                }
                function pointVisible(x, y) {
                    return x0 <= x && x <= x1 && y0 <= y && y <= y1;
                }
                function point(x, y) {
                    if (pointVisible(x, y)) listener.point(x, y);
                }
                var x__, y__, v__, x_, y_, v_, first, clean;
                function lineStart() {
                    clip.point = linePoint;
                    if (polygon) polygon.push(ring = []);
                    first = true;
                    v_ = false;
                    x_ = y_ = NaN;
                }
                function lineEnd() {
                    if (segments) {
                        linePoint(x__, y__);
                        if (v__ && v_) bufferListener.rejoin();
                        segments.push(bufferListener.buffer());
                    }
                    clip.point = point;
                    if (v_) listener.lineEnd();
                }
                function linePoint(x, y) {
                    x = Math.max(-d3_geo_clipExtentMAX, Math.min(d3_geo_clipExtentMAX, x));
                    y = Math.max(-d3_geo_clipExtentMAX, Math.min(d3_geo_clipExtentMAX, y));
                    var v = pointVisible(x, y);
                    if (polygon) ring.push([ x, y ]);
                    if (first) {
                        x__ = x, y__ = y, v__ = v;
                        first = false;
                        if (v) {
                            listener.lineStart();
                            listener.point(x, y);
                        }
                    } else {
                        if (v && v_) listener.point(x, y); else {
                            var l = {
                                a: {
                                    x: x_,
                                    y: y_
                                },
                                b: {
                                    x: x,
                                    y: y
                                }
                            };
                            if (clipLine(l)) {
                                if (!v_) {
                                    listener.lineStart();
                                    listener.point(l.a.x, l.a.y);
                                }
                                listener.point(l.b.x, l.b.y);
                                if (!v) listener.lineEnd();
                                clean = false;
                            } else if (v) {
                                listener.lineStart();
                                listener.point(x, y);
                                clean = false;
                            }
                        }
                    }
                    x_ = x, y_ = y, v_ = v;
                }
                return clip;
            };
            function corner(p, direction) {
                return abs(p[0] - x0) < ε ? direction > 0 ? 0 : 3 : abs(p[0] - x1) < ε ? direction > 0 ? 2 : 1 : abs(p[1] - y0) < ε ? direction > 0 ? 1 : 0 : direction > 0 ? 3 : 2;
            }
            function compare(a, b) {
                return comparePoints(a.x, b.x);
            }
            function comparePoints(a, b) {
                var ca = corner(a, 1), cb = corner(b, 1);
                return ca !== cb ? ca - cb : ca === 0 ? b[1] - a[1] : ca === 1 ? a[0] - b[0] : ca === 2 ? a[1] - b[1] : b[0] - a[0];
            }
        }
        if (typeof define === "function" && define.amd) {
            define(d3);
        } else if (typeof module === "object" && module.exports) {
            module.exports = d3;
        } else {
            this.d3 = d3;
        }
    }();
})();