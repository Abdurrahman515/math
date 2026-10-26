import type { ComponentType } from 'react'
import type { WidgetProps } from '../types'
import Doubling from './Doubling'
import PowerBuilder from './PowerBuilder'
import Diagonals from './Diagonals'
import Solver from './Solver'
import GuessCheck from './GuessCheck'
import ExpressionLab from './ExpressionLab'
import EquationTester from './EquationTester'
import PropertyExplorer from './PropertyExplorer'
import FunctionMachine from './FunctionMachine'


export const widgets: Record<string, ComponentType<WidgetProps>> = {
  doubling: Doubling,
  powerBuilder: PowerBuilder,
  diagonals: Diagonals,
  solver: Solver,
  guessCheck: GuessCheck,
  expressionLab: ExpressionLab,
  equationTester: EquationTester,
  propertyExplorer: PropertyExplorer,
  functionMachine: FunctionMachine
}