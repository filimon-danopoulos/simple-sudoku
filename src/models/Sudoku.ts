import Row from "./Row";
import { DIRECTION, MODE } from "../store/types";
import Cell from "./Cell";
import Solver from "./Solver";

export default class Sudoku {
  private rows: Row[];
  private activeCell: { row: number, column: number };
  private createdAt: number;

  private constructor(previous?: Sudoku) {
    this.rows = previous ? previous.rows : [];
    this.activeCell = previous ? previous.activeCell : { row: -1, column: -1 }
    this.createdAt = previous ? previous.createdAt : 0;
  }

  static create(data: ([number, boolean])[][]): Sudoku {
    const sudoku = new Sudoku();
    sudoku.createdAt = Date.now();
    sudoku.rows = data.map((d, i) => Row.create(d, i + 1));
    return sudoku
  }

  public getRows(): Row[] {
    return this.rows;
  }

  public validate(): Sudoku {
    const sudoku = new Sudoku(this)
    sudoku.rows = this.rows.map(r => r.validate());
    return sudoku;
  }

  public activateCell(row: number, column: number): Sudoku {
    const sudoku = new Sudoku(this)
    if (sudoku.activeCell.row === row && sudoku.activeCell.column === column) {
      sudoku.activeCell = { row: -1, column: -1 }
    } else {
      sudoku.activeCell = { row, column };
    }
    sudoku.rows = this.rows.map(r => r.toggleCell(row, column));
    return sudoku;
  }

  public setDigit(digit: number, mode: MODE): Sudoku {
    const sudoku = new Sudoku(this);
    sudoku.rows = this.rows.map(r => r.setDigit(digit, mode));
    return sudoku;
  }

  public removeDigit(): Sudoku {
    const sudoku = new Sudoku(this);
    sudoku.rows = this.rows.map(r => r.removeDigit());
    return sudoku;
  }

  public getSolvedNumbers(): number[] {
    const allNumbers = this.rows.reduce((acc: number[], next: Row) =>
      acc.concat(next.getCells().map(c => c.getValue() || 0), []),
      []
    );
    const solved = []
    for (let i = 1; i <= 9; i++) {
      if (allNumbers.filter(n => n === i).length === 9) {
        solved.push(i);
      }
    }
    return solved;
  }

  public navigate(dirrection: DIRECTION): Sudoku {
    const increment = (val: number) => val === 9 ? 1 : val + 1;
    const decrement = (val: number) => val === 1 ? 9 : val - 1;
    const activeCell = { ...this.activeCell }

    switch (dirrection) {
      case DIRECTION.Up:
        activeCell.row = decrement(activeCell.row);
        break;
      case DIRECTION.Down:
        activeCell.row = increment(activeCell.row);
        break;
      case DIRECTION.Right:
        activeCell.column = increment(activeCell.column);
        break;
      case DIRECTION.Left:
        activeCell.column = decrement(activeCell.column);
        break;
    }
    return this.activateCell(activeCell.row, activeCell.column);
  }

  public isSolved(): boolean {
    return this.rows.every(r => r.getCells().every(c => c.isSolved()))
  }

  public getCreationTimestamp(): number {
    return this.createdAt;
  }

  public isDigitSolved(digit: number): boolean {
    return this.rows.every(r => r.getCells().some(c => c.getValue() === digit && c.isSolved()));
  }

  public countEmptyCells(): number {
    const cells = this.rows.reduce((acc, row) => acc.concat(row.getCells()), [] as Cell[])
    return cells.reduce((sum, cell) => {
      if (cell.getValue() === null) {
        return sum + 1;
      }
      return sum;
    }, 0)
  }

  public fillCandidates(): Sudoku {
    const data = this.rows.map(r => r.getCells().map(c => c.getValue()))
    const solver = new Solver(data)
    const candidates = solver.getCandidates()
    let sudoku = new Sudoku(this);
    if (sudoku.activeCell.row !== -1 && sudoku.activeCell.column !== -1) {
      sudoku = sudoku.activateCell(sudoku.activeCell.row, sudoku.activeCell.column)
    }
    candidates.forEach((rowCandidates, row) => {
      rowCandidates.forEach((cellCandidates, cell) => {
        sudoku = sudoku.activateCell(row + 1, cell + 1)
        cellCandidates.forEach(candidate => {
          if (data[row][cell] === null) {
            sudoku = sudoku.setDigit(candidate, MODE.Note)
          }
        })
      })
    })
    return sudoku;
  }

  public isValid(): boolean {
    return this.rows.some(r => r.getCells().some(c => c.isValid()))
  }
}