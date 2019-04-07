import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import { Stage, Layer, Rect, Text, Circle } from 'react-konva';
import Konva from 'konva';
import $ from 'jquery';

const levelLength = 1000;
const blockWidth = 1;
const H = 500;
const W = levelLength * blockWidth;
const shipWidth = 16;
const shipHeight = shipWidth;
const tickRate = (1 / 30) * 1000;
const gameName = "mike";

class Lander extends React.Component {
    constructor(props) {
        super(props)
        this.courseID = props.match.params.id
        let socket = props.socket;
        this.channel = socket.channel("user:" + gameName, {});
        this.keyMap = {
            w: false,
            a: false,
            s: false,
            d: false
        };
        this.state = {
            level: [],
            ship: {
                x: 250,
                y: 250,
                dx: 0,
                dy: 0,
                angle: 90
            },
            particles: [],
            status: "playing",
            fuel: 0
        }
        this.channel
            .join()
            .receive("ok", (view) => {
            })
            .receive("error", (reason) => {
            })
    }

    keyEvent = (isKeyDown, keyCode) => {
        switch (keyCode) {
            case 87: // 87 = W
                this.keyMap.w = isKeyDown;
                break;
            case 65: // 65 = A
                this.keyMap.a = isKeyDown;
                break;
            case 83: // 83 = S
                this.keyMap.s = isKeyDown;
                break;
            case 68: // 68 = D
                this.keyMap.d = isKeyDown;
                break;
            default:
                break;
        }
    }

    componentDidMount() {
        this.channel.push("get_course", {
            id: this.courseID
        })
            .receive("ok", (view) =>
                this.setState({ level: view.level }))
        document.addEventListener("keydown", (keyEvent) => this.keyEvent(true, keyEvent.keyCode))
        document.addEventListener("keyup", (keyEvent) => this.keyEvent(false, keyEvent.keyCode))
        setInterval(this.tick, tickRate)
    }

    tick = () => {
        let newShip = _.ass
        this.channel
            .push("tick", { keymap: this.keyMap })
            .receive("ok", (view) => {
                this.setState({
                    status: view.status,
                    ship: view.ship,
                    particles: view.particles,
                    fuel: view.fuel
                })
            })
    }

    drawLevel = () => {
        let result = [];
        _.map(this.state.level, (y, x) => {
            result.push(
                <Rect
                    key={x}
                    x={x * blockWidth}
                    y={H - (y * blockWidth)}
                    width={blockWidth}
                    height={blockWidth * y}
                    fill={'black'}
                />
            )
        });
        return result;
    }

    drawParticles = () => {
        let result = []
        _.map(this.state.particles, (p, key) => {
            result.push(
                <Circle
                    key={key}
                    x={p.x}
                    y={H - p.y}
                    radius={5}
                    fill={"orange"}
                />
            )
        })
        return result
    }

    drawShip = () => {
        if (this.state.status != "crashed") {
            return <Rect
                rotation={-1 * this.state.ship.angle}
                x={this.state.ship.x}
                y={H - this.state.ship.y}
                offsetX={shipWidth / 2}
                offsetY={shipWidth / 2}
                width={shipWidth}
                height={shipHeight}
                fill={'blue'}
                shadowBlur={5}
            />;
        }
        else {
            return null;
        }
    }

    getScore = () => {
        let text = "";
        if (this.state.status == "playing") {
            return null;
        }
        else if (this.state.status == "Landed") {
            text = this.state.score;
        }
        else if (this.state.status == "crashed") {
            text = "Score: 0 (You Crashed!)"
        }
        return <Text
            align={"center"}
            fontFamily={"Courier New"}
            x={W / 2 - 300}
            y={H / 2 - 100}
            fontSize={32}
            text={text}
        />;
    }

    getStats = () => {
        return [
            <Text
                fontSize={14}
                fontFamily={"Courier New"}
                x={20}
                y={20}
                text={`Horizontal Speed: ${Math.round(this.state.ship.dx * 10)}`}
                key={1}
            />,
            <Text
                x={20}
                y={40}
                fontSize={14}
                fontFamily={"Courier New"}
                text={`Vertical Speed: ${Math.round(this.state.ship.dy * 10)}`}
                key={2}
            />,
            <Text
                x={20}
                y={60}
                fontSize={14}
                fontFamily={"Courier New"}
                text={`Fuel: ${Math.round(this.state.fuel / 4)}`}
                key={3}
            />
        ];
    }

    render() {
        return (<Stage border="10px solid black" width={W} height={H}>
            <Layer id="background">
                <Rect
                    x={0}
                    y={0}
                    width={W}
                    height={H}
                    fill={'gray'}
                />
            </Layer>
            <Layer >
                {this.drawParticles()}
            </Layer>
            <Layer id="ship-and-level">
                {this.drawShip()}
                {this.drawLevel()}
            </ Layer>
            <Layer id="stats">
                {this.getScore()}
                {this.getStats()}
            </Layer>
        </Stage>);
    }
}

export default Lander;