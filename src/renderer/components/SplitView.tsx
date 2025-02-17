import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Box, IconButton, Fade, ButtonGroup } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

type ViewMode = 'split' | 'right' | 'left'

interface Props {
  leftContent: React.ReactNode | null
  rightContent: React.ReactNode | null
  onNavigate?: (url: string) => void
}

export default function SplitView({ leftContent, rightContent }: Props) {
  const [mode, setMode] = useState<ViewMode>(leftContent ? rightContent ? 'split' : 'left' : 'right')
  const [splitRatio, setSplitRatio] = useState(0.5) // 0.5 表示 50%
  const [splitRadioSave, setSplitRadioSave] = useState(0.5) // 0.5 表示 50%
  const [isDragging, setIsDragging] = useState(false)  // 新增状态用于控制覆盖层
  const containerRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)

  const MIN_WIDTH = 200 // 最小宽度 120px
  const THRESHOLD_RATIO = MIN_WIDTH / (containerRef.current?.offsetWidth || 800) // 临界比例

  // 判断是否某一侧过窄
  const isLeftNarrow = splitRatio < THRESHOLD_RATIO
  const isRightNarrow = splitRatio > (1 - THRESHOLD_RATIO)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDraggingRef.current = true
    setIsDragging(true)  // 开始拖动时显示覆盖层
    setSplitRadioSave(splitRatio) // 保存当前比例
    e.preventDefault()
  }, [isDraggingRef.current, setIsDragging, splitRatio])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return

    const container = containerRef.current
    const containerWidth = container.offsetWidth
    const mouseX = e.clientX - container.getBoundingClientRect().left
    
    // 允许拖拽到任何位置
    const newRatio = mouseX / containerWidth
    setSplitRatio(newRatio)
  }, [isDraggingRef.current, containerRef])

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false
    setIsDragging(false)

    // 在松开时检查是否需要切换模式
    if (isLeftNarrow) {
      setMode('right')
      setSplitRatio(splitRadioSave)
    } else if (isRightNarrow) {
      setMode('left')
      setSplitRatio(splitRadioSave)
    }
  }, [isLeftNarrow, isRightNarrow, splitRadioSave])

  useEffect(() => {
    if (mode === 'split') {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [mode, handleMouseMove, handleMouseUp])

  const handleToggleLeft = () => {
    setMode(prev => prev === 'left' ? 'split' : 'right')
  }

  const handleToggleRight = () => {
    setMode(prev => prev === 'right' ? 'split' : 'left')
  }

  // 当有新的链接时，自动展开左侧面板
  useEffect(() => {
    if (leftContent && rightContent) {
      setMode('split')
    } else if (leftContent) {
      setMode('left')
    } else if (rightContent) {
      setMode('right')
    }
  }, [leftContent, rightContent])

  // 计算控制器的水平位置
  const getControlPosition = () => {
    switch (mode) {
      case 'right':
        return '0%'
      case 'left':
        return '100%'
      case 'split':
        return '50%'
    }
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        display: "flex",
        height: "100%",
        position: "relative",
        userSelect: "none", // 防止拖动时选中文本
      }}
    >
      {/* 左侧内容 */}
      <Box
        sx={{
          width:
            mode === "left"
              ? "100%"
              : mode === "right"
              ? 0
              : `${splitRatio * 100}%`,
          transition: mode === "split" ? "none" : "width 0.3s ease",
          borderRight: "1px solid",
          borderColor: "divider",
          position: "relative",
          flexShrink: 0,
        }}
      >
        <Fade in={mode !== "right"} timeout={300}>
          <Box
            sx={{
              width: "100%",
              height: "100%",
              overflow: "auto",
              visibility: mode === "right" ? "hidden" : "visible",
              opacity: mode === "right" ? 0 : 1,
              transition: "visibility 0.3s, opacity 0.3s",
              position: "relative",
            }}
          >
            {leftContent}
            {/* 拖拽时的覆盖层 */}
            {isDragging && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 10,
                  cursor: "col-resize",
                }}
              />
            )}
            {/* 窄边提示蒙版 */}
            {mode === "split" && isLeftNarrow && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: "background.paper",
                  opacity: 0.7,
                  zIndex: 9,
                  transition: "opacity 0.2s",
                }}
              />
            )}
          </Box>
        </Fade>
      </Box>

      {/* 可拖动的分界线 */}
      {mode === "split" && (
        <Box
          onMouseDown={handleMouseDown}
          sx={{
            position: "absolute",
            left: `${splitRatio * 100}%`,
            top: 0,
            width: "5px",
            height: "100%",
            transform: "translateX(-50%)",
            cursor: "col-resize",
            zIndex: 1,
            "&:hover": {
              bgcolor: "action.hover",
            },
          }}
        />
      )}

      {/* 控制按钮组 */}
      {leftContent !== null && rightContent !== null && (
        <ButtonGroup
          sx={{
            position: "absolute",
            left:
              mode === "split" ? `${splitRatio * 100}%` : getControlPosition(),
            top: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 2,
            display: "flex",
            flexDirection: "row",
            transition: mode === "split" ? "none" : "left 0.3s ease",
            "& > button": {
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              boxShadow: 1,
              "&:hover": {
                bgcolor: "action.hover",
              },
            },
          }}
        >
          <IconButton
            onClick={handleToggleLeft}
            sx={{
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              borderRight: 0,
              width: "25px",
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
          <IconButton
            onClick={handleToggleRight}
            sx={{
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
              borderLeft: "1px solid",
              borderColor: "divider",
              width: "25px",
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </ButtonGroup>
      )}

      {/* 右侧内容 */}
      <Box
        sx={{
          width:
            mode === "right"
              ? "100%"
              : mode === "left"
              ? 0
              : `${(1 - splitRatio) * 100}%`,
          transition: mode === "split" ? "none" : "width 0.3s ease",
          position: "relative",
          flexShrink: 0,
        }}
      >
        <Fade in={mode !== "left"} timeout={300}>
          <Box
            sx={{
              width: "100%",
              height: "100%",
              overflow: "auto",
              visibility: mode === "left" ? "hidden" : "visible",
              opacity: mode === "left" ? 0 : 1,
              transition: "visibility 0.3s, opacity 0.3s",
              position: "relative",
            }}
          >
            {rightContent}
            {/* 窄边提示蒙版 */}
            {mode === "split" && isRightNarrow && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: "background.paper",
                  opacity: 0.7,
                  zIndex: 9,
                  transition: "opacity 0.2s",
                }}
              />
            )}
          </Box>
        </Fade>
      </Box>
    </Box>
  );
} 