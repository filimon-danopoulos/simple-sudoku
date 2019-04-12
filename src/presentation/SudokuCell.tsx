import React, { Component, CSSProperties } from "react";
import "../layout/SudokuCell.scss";
import Cell from "../models/Cell";
import { toggleCell } from "../store/actions";

export interface ISudokuCellComponentActions {
  toggleCell: typeof toggleCell
}

export interface ISudokuCellComponentProps extends ISudokuCellComponentActions {
  cell: Cell;
  size: number;
}


export default class SudokuCellComponent extends Component<
  ISudokuCellComponentProps
  > {

  public render(): JSX.Element {
    return (
      <div
        className={`SudokuCell-container ${this.calculateClasses()}`}
        style={this.calculateStyles()}
        ref="cell"
        onClick={() => this.handleClick()}
      >
        <span className="SudokuCell-value">{this.props.cell.getValue()}</span>
      </div>
    );
  }

  private handleClick(): void {
    this.props.toggleCell(this.props.cell.getRow(), this.props.cell.getColumn())
  }

  private calculateStyles(): CSSProperties {
    const size: string = `${this.props.size}px`;
    const fontSize: string = `${Math.floor(this.props.size * 0.68)}px`;
    return {
      height: size,
      width: size,
      fontSize: fontSize
    };
  }

  private calculateClasses(): string {
    const cell = this.props.cell;
    const row = cell.getRow();
    const classes: { [key: string]: boolean } = {
      "even-block-cell": cell.getBlock() % 2 === 0,
      "given-cell": cell.isGiven(),
      "invalid-cell": cell.isValid() !== true,
      "active-cell": cell.isActive()
    };
    [...Array(10)].forEach((x, i) => classes[`row-${i}-cell`] = row === i);

    return Object.keys(classes).filter(key => classes[key]).join(" ");
  }
}