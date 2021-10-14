import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'

import Editor from '@monaco-editor/react'

import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Toolbar from '@mui/material/Toolbar'
import CircularProgress from '@mui/material/CircularProgress'

const Main = (props: any) => {
  const baseUrl = window.location.origin

  const [isLoading, setIsLoading] = useState(false)
  const [fileContent, setFileContent] = useState('')
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    console.log('from main', props.selectedFilePath)
    if (props.selectedFilePath !== '') {
      setIsLoading(true)
      axios
        .get(`${baseUrl}/SASjsDrive?filepath=${props.selectedFilePath}`)
        .then((res: any) => {
          setIsLoading(false)
          setFileContent(res.data.fileContent)
        })
    }
  }, [props.selectedFilePath])

  const handleEditSaveBtnClick = () => {
    if (!editMode) {
      setEditMode(true)
    } else {
      setIsLoading(true)
      axios
        .post(`${baseUrl}/SASjsDrive`, {
          filePath: props.selectedFilePath,
          fileContent: fileContent
        })
        .then((res) => {
          setIsLoading(false)
          setEditMode(false)
        })
    }
  }

  const handleCancelExecuteBtnClick = () => {
    if (editMode) {
      setEditMode(false)
    }
  }

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <Toolbar />
      {isLoading && (
        <CircularProgress
          style={{ position: 'fixed', left: '50%', top: '50%' }}
        />
      )}
      <Paper
        sx={{ height: '75vh', padding: '10px', overflow: 'auto' }}
        elevation={3}
      >
        {!isLoading && props?.selectedFilePath !== '' && !editMode && (
          <code style={{ whiteSpace: 'break-spaces' }}>{fileContent}</code>
        )}
        {!isLoading && props?.selectedFilePath !== '' && editMode && (
          <Editor
            height="95%"
            value={fileContent}
            onChange={(val) => {
              if (val) setFileContent(val)
            }}
          />
        )}
      </Paper>
      <Stack
        spacing={3}
        direction="row"
        sx={{ justifyContent: 'center', marginTop: '20px' }}
      >
        <Button
          variant="contained"
          onClick={handleEditSaveBtnClick}
          disabled={isLoading || props?.selectedFilePath === ''}
        >
          {!editMode ? 'Edit' : 'Save'}
        </Button>
        <Button
          variant="contained"
          onClick={handleCancelExecuteBtnClick}
          disabled={isLoading || props?.selectedFilePath === ''}
        >
          {editMode ? 'Cancel' : 'Execute'}
        </Button>
      </Stack>
    </Box>
  )
}

export default Main
