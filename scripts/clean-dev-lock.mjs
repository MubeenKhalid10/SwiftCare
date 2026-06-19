import { execSync, spawnSync } from 'node:child_process'
import { existsSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'

const DEV_PORT = Number(process.env.PORT || 3001)
const lockPath = join(process.cwd(), '.next', 'dev', 'lock')

function sleepSync(ms) {
  try {
    execSync(`powershell -NoProfile -Command "Start-Sleep -Milliseconds ${ms}"`, { stdio: 'ignore' })
  } catch {
    // Ignore sleep failures.
  }
}

function getListeningNodePids(port) {
  if (process.platform !== 'win32') return []

  try {
    const output = execSync(
      `powershell -NoProfile -Command "$p=${port}; Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique"`,
      { encoding: 'utf8' }
    ).trim()

    if (!output) return []

    return output
      .split(/\r?\n/)
      .map((value) => Number(value.trim()))
      .filter((pid) => Number.isInteger(pid) && pid > 0 && pid !== process.pid)
  } catch {
    return []
  }
}

function isNodeProcess(pid) {
  try {
    const name = execSync(
      `powershell -NoProfile -Command "(Get-Process -Id ${pid} -ErrorAction SilentlyContinue).ProcessName"`,
      { encoding: 'utf8' }
    ).trim()

    return name.toLowerCase() === 'node'
  } catch {
    return false
  }
}

function freeDevPort(port) {
  const pids = getListeningNodePids(port).filter(isNodeProcess)
  if (pids.length === 0) return false

  for (const pid of pids) {
    try {
      execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' })
      console.log(`Stopped stale Node process on port ${port} (PID ${pid}).`)
    } catch {
      // Process may have already exited.
    }
  }

  sleepSync(1000)
  return true
}

function isPortInUse(port) {
  return getListeningNodePids(port).length > 0
}

if (existsSync(lockPath)) {
  try {
    unlinkSync(lockPath)
    console.log('Removed stale Next.js dev lock file.')
  } catch (error) {
    console.warn('Could not remove dev lock file:', error instanceof Error ? error.message : error)
  }
}

freeDevPort(DEV_PORT)

if (isPortInUse(DEV_PORT)) {
  console.error(`Port ${DEV_PORT} is still in use. Close the other dev server or run:`)
  console.error(`  Get-NetTCPConnection -LocalPort ${DEV_PORT} | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`)
  process.exit(1)
}
