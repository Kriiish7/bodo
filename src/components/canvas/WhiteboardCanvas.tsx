import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { MousePointer2, Pen, Square, Circle, Eraser, Hand, Lock, Diamond, ArrowRight, Minus, Type, Image as ImageIcon, Shapes, Highlighter, StickyNote } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip'
import { Button } from '#/components/ui/button'
import { useTheme } from '#/hooks/useTheme'
import { ThemeSelector } from '#/components/ui/ThemeSelector'
import { smoothPath, getStrokeOutline } from './strokeUtils'

type Tool = 'lock' | 'hand' | 'select' | 'path' | 'rectangle' | 'ellipse' | 'eraser' | 'diamond' | 'arrow' | 'line' | 'text' | 'image' | 'library' | 'highlight' | 'sticky'

interface Camera {
  x: number
  y: number
  zoom: number
}

interface CanvasProps {
  boardId: Id<"boards">
}

// default colors — first color adapts to theme
const LIGHT_COLORS = ['#1e1e1e', '#e03131', '#2f9e44', '#1971c2', '#f08c00', '#9c36b5']
const DARK_COLORS = ['#ffffff', '#ff6b6b', '#51cf66', '#4dabf7', '#ffc078', '#cc5de8']
const STROKE_WIDTHS = [2, 4, 8]

export function WhiteboardCanvas({ boardId }: CanvasProps) {
  const elements = useQuery(api.elements.getByBoardId, { boardId })
  const addElement = useMutation(api.elements.add)
  const updateElement = useMutation(api.elements.update)
  const removeElement = useMutation(api.elements.remove)

  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, zoom: 1 })
  const [tool, setTool] = useState<Tool>('select')
  const [strokeColor, setStrokeColor] = useState(LIGHT_COLORS[0])
  const [strokeWidth, setStrokeWidth] = useState(STROKE_WIDTHS[0])
  const [fillColor, setFillColor] = useState('transparent')

  const [activeId, setActiveId] = useState<Id<"elements"> | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isPanning, setIsPanning] = useState(false)

  const svgRef = useRef<SVGSVGElement>(null)
  const { resolved: resolvedTheme } = useTheme()
  const isDark = resolvedTheme !== 'light'
  const COLORS = isDark ? DARK_COLORS : LIGHT_COLORS

  // Auto-switch ink color when toggling theme
  useEffect(() => {
    setStrokeColor((prev) => {
      if (prev === LIGHT_COLORS[0] && isDark) return DARK_COLORS[0]
      if (prev === DARK_COLORS[0] && !isDark) return LIGHT_COLORS[0]
      return prev
    })
  }, [isDark])

  // Wheel to pan/zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (e.ctrlKey) {
        setCamera(c => {
          const newZoom = Math.min(Math.max(c.zoom - e.deltaY * 0.01, 0.1), 5)
          return { ...c, zoom: newZoom }
        })
      } else {
        setCamera(c => ({
          ...c,
          x: c.x - e.deltaX / c.zoom,
          y: c.y - e.deltaY / c.zoom,
        }))
      }
    }
    const svg = svgRef.current
    if (svg) svg.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      if (svg) svg.removeEventListener('wheel', handleWheel)
    }
  }, [])

  const getCanvasCoords = (e: React.PointerEvent) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const rect = svg.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) / camera.zoom - camera.x,
      y: (e.clientY - rect.top) / camera.zoom - camera.y,
    }
  }

  const onPointerDown = async (e: React.PointerEvent) => {
    if (e.button === 1 || tool === 'hand' || e.button === 2) {
      if (tool !== 'hand') setTool('hand')
      setIsPanning(true)
      return
    }

    const { x, y } = getCanvasCoords(e)
    
    if (tool === 'select') {
      setActiveId(null)
      return
    }

    if (tool === 'path' || tool === 'highlight') {
      setIsDrawing(true)
      const id = await addElement({
        boardId,
        type: tool,
        x, y,
        points: [0, 0],
        layer: Date.now(),
        stroke: strokeColor,
        strokeWidth: tool === 'highlight' ? strokeWidth * 4 : strokeWidth,
        fill: 'transparent',
      })
      setActiveId(id)
    } else if (tool === 'text') {
      const id = await addElement({
        boardId,
        type: 'text',
        x, y,
        width: 150, height: 40,
        text: '',
        layer: Date.now(),
        stroke: strokeColor,
        strokeWidth,
        fill: 'transparent',
      })
      setActiveId(id)
      setTool('select')
    } else if (tool === 'sticky') {
      const id = await addElement({
        boardId,
        type: 'sticky',
        x, y,
        width: 150, height: 150,
        text: '',
        layer: Date.now(),
        stroke: strokeColor,
        strokeWidth,
        fill: fillColor === 'transparent' ? '#fef3c7' : fillColor,
      })
      setActiveId(id)
      setTool('select')
    } else if (['rectangle', 'ellipse', 'diamond', 'arrow', 'line'].includes(tool)) {
      setIsDrawing(true)
      const id = await addElement({
        boardId,
        type: tool as any,
        x, y,
        width: 1, height: 1,
        layer: Date.now(),
        stroke: strokeColor,
        strokeWidth,
        fill: fillColor,
      })
      setActiveId(id)
    }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (isPanning) {
      setCamera(c => ({
        ...c,
        x: c.x + e.movementX / c.zoom,
        y: c.y + e.movementY / c.zoom,
      }))
      return
    }

    if (!isDrawing || !activeId) return
    const { x, y } = getCanvasCoords(e)
    
    const el = elements?.find((el: any) => el._id === activeId)
    if (!el) return

    if ((tool === 'path' || tool === 'highlight') && (el.type === 'path' || el.type === 'highlight')) {
      const newPoints = el.points ? [...el.points, x - el.x, y - el.y] : [0, 0]
      updateElement({ elementId: activeId, points: newPoints })
    } else if (['rectangle', 'ellipse', 'diamond', 'arrow', 'line'].includes(tool)) {
      updateElement({
        elementId: activeId,
        width: x - el.x,
        height: y - el.y,
      })
    } else if (tool === 'select') {
      // Basic movement (drags from top-left for simplicity)
      updateElement({
        elementId: activeId,
        x: x, 
        y: y,
      })
    }
  }

  const onPointerUp = () => {
    setIsDrawing(false)
    setIsPanning(false)
    if (tool !== 'select' && activeId) {
      setActiveId(null)
    }
  }

  const handleElementHover = (id: Id<"elements">) => {
    if (tool === 'eraser' && isDrawing) {
      removeElement({ elementId: id })
    }
  }

  const handleElementDown = (e: React.PointerEvent, id: Id<"elements">) => {
    if (tool === 'eraser') {
      removeElement({ elementId: id })
      return
    }
    if (tool === 'select') {
      e.stopPropagation()
      setActiveId(id)
      setIsDrawing(true)
    }
  }

  const TOOLS = [
    { id: 'lock', icon: Lock, label: 'Lock Field Resonance (Keep active)' },
    { divider: true },
    { id: 'hand', icon: Hand, label: 'Gravimetric Tether (Pan)', shortcut: 'H' },
    { id: 'select', icon: MousePointer2, label: 'Spatial Selection', shortcut: '1' },
    { id: 'rectangle', icon: Square, label: 'Vector-Cube', shortcut: '2' },
    { id: 'diamond', icon: Diamond, label: 'Crystal-Lattice', shortcut: '3' },
    { id: 'ellipse', icon: Circle, label: 'Orbital Sphere', shortcut: '4' },
    { id: 'arrow', icon: ArrowRight, label: 'Kinetic Vector', shortcut: '5' },
    { id: 'line', icon: Minus, label: 'Tether Line', shortcut: '6' },
    { id: 'path', icon: Pen, label: 'Anti-Gravity Light-Brush', shortcut: '7' },
    { id: 'highlight', icon: Highlighter, label: 'Quantum Ionizer', shortcut: '8' },
    { id: 'text', icon: Type, label: 'Holo-Text', shortcut: '9' },
    { id: 'sticky', icon: StickyNote, label: 'Data-Placard', shortcut: 'S' },
    { id: 'image', icon: ImageIcon, label: 'Matter Insertion (Image)', shortcut: 'I' },
    { id: 'eraser', icon: Eraser, label: 'Matter Annihilator', shortcut: '0' },
    { divider: true },
    { id: 'library', icon: Shapes, label: 'Construct Library' },
  ]

  const renderShapes = () => {
    return elements?.map((el: any) => {
      const isSelected = activeId === el._id
      const sw = el.strokeWidth || 2
      const stroke = isSelected && tool === 'select' ? '#3b82f6' : (el.stroke || '#000')
      
      const commonProps = {
        stroke,
        fill: el.fill || 'transparent',
        strokeWidth: sw,
        strokeLinecap: 'round' as const,
        strokeLinejoin: 'round' as const,
        onPointerEnter: () => handleElementHover(el._id),
        onPointerDown: (e: React.PointerEvent) => handleElementDown(e, el._id),
        cursor: tool === 'select' ? 'move' : (tool === 'eraser' ? 'pointer' : 'crosshair'),
        style: { pointerEvents: (tool === 'hand' && !isSelected) ? 'none' : 'visiblePainted' } as React.CSSProperties
      }

      if (el.type === 'path' || el.type === 'highlight') {
        if (!el.points || el.points.length < 4) {
          return (
            <circle
              key={el._id}
              cx={el.x}
              cy={el.y}
              r={sw / 2}
              {...commonProps}
              fill={stroke}
              fillOpacity={el.type === 'highlight' ? 0.3 : 1}
              stroke="none"
            />
          )
        }
        // Use variable-width outline for localized gravity solid light extrusion
        const outlinePath = getStrokeOutline(el.points, el.pressures, el.x, el.y, sw)
        if (outlinePath) {
          return (
            <path
              key={el._id}
              d={outlinePath}
              fill={stroke}
              fillOpacity={el.type === 'highlight' ? 0.3 : 1}
              stroke="none"
              onPointerEnter={() => handleElementHover(el._id)}
              onPointerDown={(e: React.PointerEvent) => handleElementDown(e, el._id)}
              cursor={commonProps.cursor}
              style={{
                ...commonProps.style as any,
                filter: `drop-shadow(0px 0px ${sw}px ${stroke}aa)`,
              }}
            />
          )
        }
        // Fallback: spatial distortion smoothing bezier path
        const d = smoothPath(el.points, el.x, el.y)
        return <path key={el._id} d={d} {...commonProps} strokeOpacity={el.type === 'highlight' ? 0.3 : 1} fill="none" style={{ ...commonProps.style as any, filter: `drop-shadow(0px 0px ${sw}px ${stroke}aa)` }} />
      }
      if (el.type === 'text' || el.type === 'sticky') {
        const isSticky = el.type === 'sticky'
        const rx = (el.width || 0) < 0 ? el.x + (el.width || 0) : el.x
        const ry = (el.height || 0) < 0 ? el.y + (el.height || 0) : el.y
        const w = Math.max(Math.abs(el.width || 0), 100)
        const h = Math.max(Math.abs(el.height || 0), isSticky ? 100 : 40)
        
        return (
          <g key={el._id} onPointerEnter={commonProps.onPointerEnter} onPointerDown={commonProps.onPointerDown} style={commonProps.style}>
            {isSticky && (
              <rect x={rx} y={ry} width={w} height={h} fill={el.fill} stroke={commonProps.stroke} strokeWidth={commonProps.strokeWidth} rx={4} />
            )}
            <foreignObject x={rx} y={ry} width={w} height={h} cursor={commonProps.cursor}>
              <textarea
                value={el.text || ''}
                readOnly={tool !== 'select' || activeId !== el._id}
                onChange={(e) => updateElement({ elementId: el._id, text: e.target.value })}
                className={`w-full h-full resize-none outline-none bg-transparent font-medium ${isSticky ? 'p-3' : 'p-1'}`}
                style={{ 
                  color: el.stroke || '#000', 
                  fontSize: isSticky ? '18px' : '22px', 
                  border: activeId === el._id && tool === 'select' && !isSticky ? '1px dashed #3b82f6' : 'none', 
                  pointerEvents: activeId === el._id ? 'auto' : 'none' 
                }}
                placeholder={isSticky ? 'Type something...' : 'Text here...'}
              />
            </foreignObject>
          </g>
        )
      }
      if (el.type === 'rectangle') {
        const rx = el.width < 0 ? el.x + el.width : el.x
        const ry = el.height < 0 ? el.y + el.height : el.y
        const w = Math.abs(el.width)
        const h = Math.abs(el.height)
        return <rect key={el._id} x={rx} y={ry} width={w || 0} height={h || 0} rx={4} {...commonProps} />
      }
      if (el.type === 'ellipse') {
        const cx = el.x + el.width / 2
        const cy = el.y + el.height / 2
        const rx = Math.abs(el.width / 2)
        const ry = Math.abs(el.height / 2)
        return <ellipse key={el._id} cx={cx} cy={cy} rx={rx || 0} ry={ry || 0} {...commonProps} />
      }
      if (el.type === 'diamond') {
        const cx = el.x + (el.width || 0) / 2
        const cy = el.y + (el.height || 0) / 2
        const hw = Math.abs((el.width || 0) / 2)
        const hh = Math.abs((el.height || 0) / 2)
        const d = `M ${cx} ${cy - hh} L ${cx + hw} ${cy} L ${cx} ${cy + hh} L ${cx - hw} ${cy} Z`
        return <path key={el._id} d={d} {...commonProps} />
      }
      if (el.type === 'arrow') {
        const x2 = el.x + (el.width || 0)
        const y2 = el.y + (el.height || 0)
        const angle = Math.atan2(y2 - el.y, x2 - el.x)
        const headLen = 12
        return (
          <g key={el._id} {...commonProps} fill="none">
            <line x1={el.x} y1={el.y} x2={x2} y2={y2} />
            <line x1={x2} y1={y2} x2={x2 - headLen * Math.cos(angle - Math.PI / 6)} y2={y2 - headLen * Math.sin(angle - Math.PI / 6)} />
            <line x1={x2} y1={y2} x2={x2 - headLen * Math.cos(angle + Math.PI / 6)} y2={y2 - headLen * Math.sin(angle + Math.PI / 6)} />
          </g>
        )
      }
      if (el.type === 'line') {
        return (
          <line
            key={el._id}
            x1={el.x}
            y1={el.y}
            x2={el.x + (el.width || 0)}
            y2={el.y + (el.height || 0)}
            {...commonProps}
            fill="none"
          />
        )
      }
      return null
    })
  }

  const cursorClass = tool === 'hand' 
    ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') 
    : (tool === 'select' ? 'cursor-default' : 'cursor-crosshair')

  return (
    <div className={`relative w-full h-full overflow-hidden flex flex-col items-center select-none ${cursorClass}`}>
      {/* Excalidraw-like Dot Grid Background overlay! */}
      <div 
        className="absolute inset-0 pointer-events-none z-0" 
        style={{
          backgroundImage: isDark
            ? 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)'
            : 'linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)',
          backgroundSize: `${20 * camera.zoom}px ${20 * camera.zoom}px`,
          backgroundPosition: `${(camera.x * camera.zoom) % (20 * camera.zoom)}px ${(camera.y * camera.zoom) % (20 * camera.zoom)}px`
        }}
      />
      
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full touch-none z-0"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <g transform={`scale(${camera.zoom}) translate(${camera.x}, ${camera.y})`}>
          {renderShapes()}
        </g>
      </svg>

      {/* Top Center Toolbar */}
      <div className="absolute top-4 z-10 flex flex-col items-center gap-3">
        <div className="flex border border-slate-200/80 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-1 bg-white items-center gap-0.5">
          {TOOLS.map((t, idx) => {
            if (t.divider) {
              return <div key={`div-${idx}`} className="w-[1.5px] h-6 bg-slate-100 mx-1" />
            }
            const Icon = t.icon!
            const isActive = tool === t.id
            return (
              <Tooltip key={t.id}>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <button
                      onClick={() => setTool(t.id as Tool)}
                      className={`p-2 rounded-[8px] transition-colors flex items-center justify-center min-w-[36px] min-h-[36px] ${
                        isActive
                          ? 'bg-[#e2dffe] text-[#34277b]'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                    </button>
                    {t.shortcut && (
                      <span className="absolute bottom-1 right-1 pointer-events-none text-[8px] font-medium opacity-50">
                        {t.shortcut}
                      </span>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  sideOffset={8}
                  className="text-xs bg-slate-900 text-white font-medium shadow-lg px-2.5 py-1.5 rounded-md border-0"
                >
                  {t.label}
                  {t.shortcut && <span className="ml-1.5 text-slate-400">({t.shortcut})</span>}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>
        <div className="text-[12px] text-slate-400/90 font-medium select-none pointer-events-none tracking-wide text-center bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 border border-slate-100/50 shadow-sm">
          To shift orbital view, hold <kbd className="px-1.5 py-px bg-slate-100 border border-slate-200/80 rounded text-slate-500/90 font-mono text-[10px]">Scroll wheel</kbd> or <kbd className="px-1.5 py-[1px] bg-slate-100 border border-slate-200/80 rounded text-slate-500/90 font-mono text-[10px]">Space</kbd> while dragging, or use the tether
        </div>
      </div>

      {/* Left Property Panel */}
      <div className="absolute left-4 top-24 z-10 w-52 flex flex-col gap-5 border border-slate-200 rounded-xl shadow-lg p-4 bg-white/95 backdrop-blur-md pointer-events-auto">
        <div>
          <h4 className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">Quantum Spin State (Color)</h4>
          <div className="flex flex-wrap gap-2">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setStrokeColor(c)}
                className={`w-6 h-6 rounded-md shadow-sm border border-black/10 transition-transform hover:scale-110 flex items-center justify-center ${strokeColor === c ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">Background</h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFillColor('transparent')}
              className={`relative w-6 h-6 rounded-md shadow-sm border border-slate-200 bg-white transition-transform hover:scale-110 flex items-center justify-center ${fillColor === 'transparent' ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
            >
              <span className="absolute w-full h-px bg-red-400 rotate-45" />
            </button>
            {COLORS.slice(1).map(c => (
              <button
                key={c}
                onClick={() => setFillColor(c + '33')} // 20% opacity hex
                className={`w-6 h-6 rounded-md shadow-sm border border-black/10 transition-transform hover:scale-110 flex items-center justify-center ${fillColor === c + '33' ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                style={{ backgroundColor: c + '40' }}
              />
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">Dark Matter Density (Width)</h4>
          <div className="flex items-center gap-2">
            {STROKE_WIDTHS.map((width) => (
              <button
                key={width}
                onClick={() => setStrokeWidth(width)}
                className={`flex-1 h-8 rounded-md bg-slate-50 flex items-center justify-center border transition-all hover:bg-slate-100 ${strokeWidth === width ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200'}`}
              >
                <div 
                  className="bg-current rounded-full" 
                  style={{ width: width * 1.5, height: width * 1.5, color: strokeColor }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Left Zoom Controls */}
      <div className="absolute bottom-4 left-4 z-10 flex border border-slate-200 rounded-lg shadow-sm p-1 bg-white items-center gap-1 backdrop-blur-md pointer-events-auto">
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm text-slate-600 hover:text-slate-900" onClick={() => setCamera(c => ({ ...c, zoom: Math.max(c.zoom - 0.1, 0.1) }))}>
          -
        </Button>
        <div className="w-12 text-center text-xs font-semibold text-slate-700 cursor-pointer select-none" onClick={() => setCamera(c => ({ ...c, zoom: 1 }))}>
          {Math.round(camera.zoom * 100)}%
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm text-slate-600 hover:text-slate-900" onClick={() => setCamera(c => ({ ...c, zoom: Math.min(c.zoom + 0.1, 5) }))}>
          +
        </Button>
      </div>

      {/* Bottom Right Theme Toggle */}
      <div className="absolute bottom-4 right-4 z-10 pointer-events-auto">
        <ThemeSelector />
      </div>
    </div>
  )
}
