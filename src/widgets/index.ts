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
import IntExplorer from './IntExplorer'
import PlotTask from './PlotTask'
import CompareLine from './CompareLine'
import OrderTask from './OrderTask'
import PlaneExplorer from './PlaneExplorer'
import PlanePlot from './PlanePlot'
import PlaneRead from './PlaneRead'
import ChipsAdd from './ChipsAdd'
import AddLine from './AddLine'
import ChipsSub from './ChipsSub'
import SubLine from './SubLine'
import GroupsMul from './GroupsMul'
import MulPattern from './MulPattern'
import PatternTable from './PatternTable'
import ChipsDiv from './ChipsDiv'
import Sorter from './Sorter'
import TileBalance from './TileBalance'
import EqualGroups from './EqualGroups'
import ReverseChain from './ReverseChain'
import TwoStepSolver from './TwoStepSolver'
import RectLab from './RectLab'
import TablePlot from './TablePlot'
import GraphLine from './GraphLine'
import RatioGroups from './RatioGroups'
import UnitRate from './UnitRate'
import ConvertSteps from './ConvertSteps'
import MetricShift from './MetricShift'
import CrossProduct from './CrossProduct'
import BounceDraw from './BounceDraw'
import BarModel from './BarModel'
import ScaleMap from './ScaleMap'
import PercentGrid from './PercentGrid'


export const widgets: Record<string, ComponentType<WidgetProps>> = {
  doubling: Doubling,
  powerBuilder: PowerBuilder,
  diagonals: Diagonals,
  solver: Solver,
  guessCheck: GuessCheck,
  expressionLab: ExpressionLab,
  equationTester: EquationTester,
  propertyExplorer: PropertyExplorer,
  functionMachine: FunctionMachine,
  intExplorer: IntExplorer,
  plotTask: PlotTask,
  compareLine: CompareLine,
  orderTask: OrderTask,
  planeExplorer: PlaneExplorer,
  planePlot: PlanePlot,
  planeRead: PlaneRead,
  chipsAdd: ChipsAdd,
  addLine: AddLine,
  chipsSub: ChipsSub,
  subLine: SubLine,
  groupsMul: GroupsMul,
  mulPattern: MulPattern,
  patternTable: PatternTable,
  chipsDiv: ChipsDiv,
  sorter: Sorter,
  tileBalance: TileBalance,
  equalGroups: EqualGroups,
  reverseChain: ReverseChain,
  twoStepSolver: TwoStepSolver,
  rectLab: RectLab,
  tablePlot: TablePlot,
  graphLine: GraphLine,
  ratioGroups: RatioGroups,
  unitRate: UnitRate,
  convertSteps: ConvertSteps,
  metricShift: MetricShift,
  crossProduct: CrossProduct,
  bounceDraw: BounceDraw,
  barModel: BarModel,
  scaleMap: ScaleMap,
  percentGrid: PercentGrid,
}