// src/global/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { refreshAccessToken } from '@/redux/actions/authActions.js'

function isExpired(jwt) {
  try {
    const [, payload] = jwt.split('.')
    const { exp } = JSON.parse(atob(payload))
    return typeof exp === 'number' ? Date.now() >= exp * 1000 : true
  } catch { return true }
}

export default function ProtectedRoute() {
  const location = useLocation()
  const dispatch = useDispatch()

  const reduxToken = useSelector(state => state.auth?.token)
  const storageToken = localStorage.getItem('token') || sessionStorage.getItem('token')
  const token = reduxToken || storageToken

  const [checked, setChecked] = useState(false)
  const [ok, setOk] = useState(!!token)

  useEffect(() => {
    let mounted = true
    const run = async () => {
      if (!token) { setChecked(true); setOk(false); return }
      if (!isExpired(token)) { setChecked(true); setOk(true); return }
      // süresi dolmuş → bir kez refresh dene
      try {
        await dispatch(refreshAccessToken())
        if (mounted) { setChecked(true); setOk(true) }
      } catch {
        if (mounted) { setChecked(true); setOk(false) }
      }
    }
    run()
    return () => { mounted = false }
  }, [token, dispatch])

  if (!checked) {
    return (
      <div className="min-h-[40vh] grid place-items-center bg-background text-foreground">
        <div className="w-8 h-8 border-4 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }


  if (!ok) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
