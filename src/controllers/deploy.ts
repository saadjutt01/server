import { MemberType, FolderMember, ServiceMember } from '../types'
import { getTmpFilesFolderPath } from '../utils/file'
import { createFolder, createFile, asyncForEach } from '@sasjs/utils'
import path from 'path'

export const createFileTree = async (
  members: [FolderMember, ServiceMember],
  parentFolders: string[] = []
) => {
  const destinationPath = path.join(
    getTmpFilesFolderPath(),
    path.join(...parentFolders)
  )

  await asyncForEach(members, async (member: FolderMember | ServiceMember) => {
    const name = member.name

    if (member.type === MemberType.folder) {
      await createFolder(path.join(destinationPath, name)).catch((err) =>
        Promise.reject({ error: err, failedToCreate: name })
      )

      await createFileTree(member.members, [...parentFolders, name]).catch(
        (err) => Promise.reject({ error: err, failedToCreate: name })
      )
    } else {
      await createFile(path.join(destinationPath, name), member.code).catch(
        (err) => Promise.reject({ error: err, failedToCreate: name })
      )
    }
  })

  return Promise.resolve()
}

export const getTreeExample = () => ({
  message: 'Provided not supported data format.',
  supportedFormat: {
    members: [
      {
        name: 'jobs',
        type: 'folder',
        members: [
          {
            name: 'extract',
            type: 'folder',
            members: [
              {
                name: 'makedata1',
                type: 'service',
                code: '%put Hello World!;'
              }
            ]
          }
        ]
      }
    ]
  }
})
