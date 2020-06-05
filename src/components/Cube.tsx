import React, { useRef, useEffect, useState } from 'react';
import { useSpring, animated, SpringValue } from 'react-spring';
import { usePrevious } from './use-previous';
import { Pane } from './Pane';
import useScrollLock from 'use-scroll-lock';
import { createGesture, GestureDetail } from '@ionic/react';

export interface CubeIndexObject {
    index: number;
    immediate: boolean;
}

export type CubeIndex = number | CubeIndexObject;

export interface CubeProps {
    hasNext?: (i: number) => boolean;
    index: CubeIndex;
    onChange: (i: number) => void;
    renderItem: (i: number, active: boolean, rotate: SpringValue<number>) => React.ReactNode;
    width?: number;
    height?: number;
    perspective?: number;
    paneStyle?: React.CSSProperties;
    scaleRange?: [number, number];
    lockScrolling?: boolean;
    enableGestures?: boolean;
}

/**
 * React-Cube
 *
 * A 3d rotated cube which supports gestures
 * and an infinite number of views (i.e., it supports
 * windowing). It's inspired by the instagram story
 * inteface.
 */

export default function Cube({
    hasNext = () => true,
    onChange,
    index: providedIndex,
    renderItem,
    width = 200,
    height = 600,
    perspective = 800,
    paneStyle,
    scaleRange = [1, 0.95],
    lockScrolling = false,
    enableGestures = true,
}: CubeProps) {
    const cubeRef = useRef<HTMLDivElement>(null);

    // optionally allow the user to pass in an object
    // with an index and animated property. This allows
    // the user to skip to an index without animating.
    let { immediate, index } =
        typeof providedIndex === 'number' ? { immediate: false, index: providedIndex } : providedIndex;

    const [props, set] = useSpring(() => ({
        rotateY: index * -90,
        immediate: true,
    }));

    const prevIndex = usePrevious(index);
    const currentActivePane = index % 4;
    const direction = useRef(true);

    const [indexesToRender, setIndexesToRender] = useState([0,1,2,-1])

    useEffect(() => {
        if (typeof prevIndex === 'number' && prevIndex !== index) {
            setIndexesToRender((indexesToRender) => assignIndexes(index, index > prevIndex, [...indexesToRender]))
        }
    }, [index, prevIndex])

    const assignIndexes = (index: number, forward: boolean, panes = [-1, -1, -1, -1]) => {

        let directionChanged: boolean = false;
    
        if (direction.current !== forward) {
            directionChanged = true;
            direction.current = forward;
        }
    
        const activePane = index % 4;
        panes[activePane] = index;
    
        const prevPane = getPreviousPane(activePane - 1);
        const nextPane = getNextPane(activePane + 1);
    
        if (forward) {

            if (directionChanged) {
                panes[nextPane] = panes[nextPane] + 4
            }
            panes[getNextPane(nextPane + 1)] = panes[getNextPane(nextPane + 1)] + 4;

        } else {
            
            if (directionChanged) {
                panes[prevPane] = panes[prevPane] - 4
            }
            panes[getPreviousPane(prevPane - 1)] = panes[getPreviousPane(prevPane - 1)] - 4;

        }
        return panes;
    }

    const [animating, setAnimating] = React.useState(false);

    // lock body scrolling when gesturing or animating
    useScrollLock(animating || lockScrolling);

    /**
     * Animate our cube into position when our active
     * index changes
     */
    useEffect(() => {

        const onRest = () => {
            setAnimating(false);
        };

        setAnimating(true);
        set({ rotateY: index * 90 * -1, immediate, onRest });
    }, [index, set, immediate]);

    useEffect(() => {
        let started: boolean = false;

        const swipeGesture = createGesture({
            el: cubeRef.current!,
            gestureName: 'swipe-gesture',
            direction: 'x',
            gesturePriority: 50,
            onMove: (ev) => onMove(ev),
            onEnd: (ev) => onEnd(ev)
        });
        swipeGesture.enable(true);

        const onMove = (ev: GestureDetail) => {

            if (index === 0 && ev.deltaX > 0) {
                return;
            }

            if (!started) {
                setAnimating(true);
                started = true;
            }
            const currentRotate = index * 90 * -1;
            const convert = linearConversion([0, width], [currentRotate, currentRotate + 90]);
            let v = convert(ev.deltaX);
            if (v > currentRotate + 90) {
                v = currentRotate + 90;
            } else if (v < currentRotate - 90) {
                v = currentRotate - 90;
            }
            set({
                rotateY: v,
                immediate: true,
            });
        };

        const onEnd = (ev: GestureDetail) => {
            console.log(ev)
            if (Math.abs(ev.velocityX) > 0.12) {
                onChange(ev.deltaX < 0 ? index + 1 : index - 1);
                return;
            }

            // next
            if (ev.deltaX < -(width / 2)) {
                onChange(index + 1);

                // prev
            } else if (ev.deltaX > width / 2) {
                onChange(index - 1);

                // current
            } else {
                set({
                    rotateY: index * 90 * -1,
                    onRest: () => {
                        swipeGesture.enable(true);
                        setAnimating(false);
                    },
                    immediate: false,
                });
            }

            swipeGesture.enable(false);
            // setAnimating(false);
            started = false;
        };

        return () => {
            swipeGesture.destroy();
        };
    }, [cubeRef, index, onChange, set, width]);

    /**
     * Handle rendering of individual panes.
     */

    return (
        <animated.div
            className="Cube"
            ref={cubeRef}
            style={{
                width: width + 'px',
                height: height + 'px',
                transform: props.rotateY.to((x: number) => `scale(${getScale(x, scaleRange)})`),
                perspective: perspective + 'px',
            }}
        >
            <animated.div
                className="Cube__animated-container"
                style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    backfaceVisibility: 'visible',
                    transformStyle: 'preserve-3d',
                    transform: props.rotateY.to((x: number) => `translateZ(-${width / 2}px) rotateY(${x}deg)`),
                }}
            >
                {/* The initial left  pane */}
                <Pane width={width} height={height} rotate={-90} active={currentActivePane === 3} style={paneStyle}>
                    {renderItem(indexesToRender[3], currentActivePane === 3 && !animating, props.rotateY)}
                </Pane>

                {/* The initial front  pane */}
                <Pane width={width} height={height} rotate={0} active={currentActivePane === 0} style={paneStyle}>
                    {renderItem(indexesToRender[0], currentActivePane === 0 && !animating, props.rotateY)}
                </Pane>

                {/* The initial right pane */}
                <Pane width={width} height={height} rotate={90} active={currentActivePane === 1} style={paneStyle}>
                    {renderItem(indexesToRender[1], currentActivePane === 1 && !animating, props.rotateY)}
                </Pane>

                {/* The initial back pane */}
                <Pane width={width} height={height} rotate={-180} active={currentActivePane === 2} style={paneStyle}>
                    {renderItem(indexesToRender[2], currentActivePane === 2 && !animating, props.rotateY)}
                </Pane>
            </animated.div>
        </animated.div>
    );
}

function getScale(x: number, scaleRange: [number, number]) {
    const diff = Math.abs(x) % 90;

    if (!diff) {
        return 1;
    }

    const convert = diff > 45 ? linearConversion([90, 45], [1, 0.5]) : linearConversion([45, 0], [0.5, 1]);

    const eased = circ(convert(diff));
    const scale = linearConversion([1, 0.5], scaleRange);
    return scale(eased);
}

function linearConversion(a: [number, number], b: [number, number]) {
    var o = a[1] - a[0],
        n = b[1] - b[0];

    return function (x: number) {
        return ((x - a[0]) * n) / o + b[0];
    };
}

function circ(timeFraction: number) {
    return 1 - Math.sin(Math.acos(timeFraction));
}

function getPreviousPane(i: number) {
    if (i > -1) return i;
    return 3;
}

function getNextPane(i: number) {
    if (i < 4) return i;
    return 0;
}
