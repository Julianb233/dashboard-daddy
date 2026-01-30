'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface HierarchyLinesProps {
  commanderRef: React.RefObject<HTMLElement>
  squadRefs: React.RefObject<HTMLElement>[]
  className?: string
}

export function HierarchyLines({ commanderRef, squadRefs, className = '' }: HierarchyLinesProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const updateLines = () => {
      if (!commanderRef.current) return

      const commanderRect = commanderRef.current.getBoundingClientRect()
      const svgRect = svg.getBoundingClientRect()
      
      // Clear existing paths
      while (svg.firstChild) {
        svg.removeChild(svg.firstChild)
      }

      // Commander center point
      const commanderX = commanderRect.left + commanderRect.width / 2 - svgRect.left
      const commanderY = commanderRect.bottom - svgRect.top

      squadRefs.forEach((squadRef, index) => {
        if (!squadRef.current) return

        const squadRect = squadRef.current.getBoundingClientRect()
        const squadX = squadRect.left + squadRect.width / 2 - svgRect.left
        const squadY = squadRect.top - svgRect.top

        // Create path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        
        // Curved line with control points
        const controlY = commanderY + (squadY - commanderY) * 0.6
        const d = `M ${commanderX} ${commanderY} Q ${commanderX} ${controlY} ${squadX} ${squadY}`
        
        path.setAttribute('d', d)
        path.setAttribute('stroke', `url(#gradient-${index})`)
        path.setAttribute('stroke-width', '2')
        path.setAttribute('fill', 'none')
        path.setAttribute('opacity', '0.6')
        
        // Add animated dash
        const pathLength = path.getTotalLength()
        path.setAttribute('stroke-dasharray', `${pathLength}`)
        path.setAttribute('stroke-dashoffset', `${pathLength}`)
        
        // Create gradient
        const defs = svg.querySelector('defs') || svg.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'defs'))
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient')
        gradient.setAttribute('id', `gradient-${index}`)
        gradient.setAttribute('gradientUnits', 'userSpaceOnUse')
        gradient.setAttribute('x1', `${commanderX}`)
        gradient.setAttribute('y1', `${commanderY}`)
        gradient.setAttribute('x2', `${squadX}`)
        gradient.setAttribute('y2', `${squadY}`)
        
        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
        stop1.setAttribute('offset', '0%')
        stop1.setAttribute('stop-color', '#f59e0b')
        stop1.setAttribute('stop-opacity', '0.8')
        
        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
        stop2.setAttribute('offset', '100%')
        
        // Squad-specific colors
        const squadColors = ['#3b82f6', '#10b981', '#8b5cf6', '#f97316']
        stop2.setAttribute('stop-color', squadColors[index] || '#10b981')
        stop2.setAttribute('stop-opacity', '0.8')
        
        gradient.appendChild(stop1)
        gradient.appendChild(stop2)
        defs.appendChild(gradient)
        
        svg.appendChild(path)

        // Animate the line
        const animation = path.animate([
          { strokeDashoffset: pathLength },
          { strokeDashoffset: 0 }
        ], {
          duration: 2000 + index * 200,
          easing: 'ease-out',
          fill: 'forwards'
        })

        // Add pulsing effect
        const pulseAnimation = path.animate([
          { opacity: 0.6 },
          { opacity: 0.9 },
          { opacity: 0.6 }
        ], {
          duration: 3000,
          iterations: Infinity,
          easing: 'ease-in-out',
          delay: index * 500
        })
      })

      // Add energy particles
      addEnergyParticles(svg, commanderX, commanderY, squadRefs)
    }

    const addEnergyParticles = (svg: SVGSVGElement, commanderX: number, commanderY: number, squadRefs: React.RefObject<HTMLElement>[]) => {
      squadRefs.forEach((squadRef, index) => {
        if (!squadRef.current) return

        const squadRect = squadRef.current.getBoundingClientRect()
        const svgRect = svg.getBoundingClientRect()
        const squadX = squadRect.left + squadRect.width / 2 - svgRect.left
        const squadY = squadRect.top - svgRect.top

        // Create animated particle
        const particle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        particle.setAttribute('r', '3')
        particle.setAttribute('fill', '#f59e0b')
        particle.setAttribute('opacity', '0.8')
        
        // Animate particle along path
        const animateMotion = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion')
        
        const controlY = commanderY + (squadY - commanderY) * 0.6
        const path = `M ${commanderX} ${commanderY} Q ${commanderX} ${controlY} ${squadX} ${squadY}`
        animateMotion.setAttribute('path', path)
        animateMotion.setAttribute('dur', '4s')
        animateMotion.setAttribute('repeatCount', 'indefinite')
        animateMotion.setAttribute('begin', `${index * 1000}ms`)
        
        particle.appendChild(animateMotion)
        svg.appendChild(particle)
      })
    }

    updateLines()
    
    const handleResize = () => updateLines()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [commanderRef, squadRefs])

  return (
    <svg
      ref={svgRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
    </svg>
  )
}