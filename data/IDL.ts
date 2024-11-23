export type CardinalStakePool =
  {
    version: "0.1.0",
    name: "nexus",
    instructions: [
      {
        name: "initUser",
        accounts: [
          {
            name: "user",
            isMut: true,
            isSigner: false
          },
          {
            name: "authority",
            isMut: true,
            isSigner: true
          },
          {
            name: "systemProgram",
            isMut: false,
            isSigner: false
          }
        ],
        args: [
          {
            name: "info",
            type: {
              defined: "UserInfo"
            }
          }
        ]
      },
      {
        name: "updateUser",
        accounts: [
          {
            name: "user",
            isMut: true,
            isSigner: false
          },
          {
            name: "authority",
            isMut: true,
            isSigner: true
          },
          {
            name: "systemProgram",
            isMut: false,
            isSigner: false
          }
        ],
        args: [
          {
            name: "info",
            type: {
              defined: "UpdateUserInfo"
            }
          }
        ]
      },
      {
        name: "closeUser",
        accounts: [
          {
            name: "user",
            isMut: true,
            isSigner: false
          },
          {
            name: "authority",
            isMut: true,
            isSigner: true
          },
          {
            name: "systemProgram",
            isMut: false,
            isSigner: false
          }
        ],
        args: []
      },
      {
        name: "initProject",
        accounts: [
          {
            name: "project",
            isMut: true,
            isSigner: false
          },
          {
            name: "founder",
            isMut: true,
            isSigner: false
          },
          {
            name: "authority",
            isMut: true,
            isSigner: true
          },
          {
            name: "systemProgram",
            isMut: false,
            isSigner: false
          }
        ],
        args: [
          {
            name: "info",
            type: {
              defined: "ProjectInfo"
            }
          }
        ]
      },
      {
        name: "updateProject",
        accounts: [
          {
            name: "project",
            isMut: true,
            isSigner: false
          },
          {
            name: "founder",
            isMut: true,
            isSigner: false
          },
          {
            name: "authority",
            isMut: true,
            isSigner: true
          },
          {
            name: "systemProgram",
            isMut: false,
            isSigner: false
          }
        ],
        args: [
          {
            name: "info",
            type: {
              defined: "UpdateProjectInfo"
            }
          }
        ]
      },
      {
        name: "initInvitation",
        accounts: [
          {
            name: "invitation",
            isMut: true,
            isSigner: false
          },
          {
            name: "project",
            isMut: true,
            isSigner: false
          },
          {
            name: "founder",
            isMut: true,
            isSigner: false
          },
          {
            name: "user",
            isMut: true,
            isSigner: false
          },
          {
            name: "authority",
            isMut: true,
            isSigner: true
          },
          {
            name: "systemProgram",
            isMut: false,
            isSigner: false
          }
        ],
        args: [
          {
            name: "role",
            type: "string"
          }
        ]
      },
      {
        name: "acceptInvt",
        accounts: [
          {
            name: "apa",
            isMut: true,
            isSigner: false
          },
          {
            name: "invitation",
            isMut: true,
            isSigner: false
          },
          {
            name: "project",
            isMut: true,
            isSigner: false
          },
          {
            name: "user",
            isMut: true,
            isSigner: false
          },
          {
            name: "authority",
            isMut: true,
            isSigner: true
          },
          {
            name: "systemProgram",
            isMut: false,
            isSigner: false
          }
        ],
        args: []
      },
      {
        name: "refuseInvt",
        accounts: [
          {
            name: "invitation",
            isMut: true,
            isSigner: false
          },
          {
            name: "project",
            isMut: false,
            isSigner: false
          },
          {
            name: "user",
            isMut: true,
            isSigner: false
          },
          {
            name: "authority",
            isMut: true,
            isSigner: true
          },
          {
            name: "systemProgram",
            isMut: false,
            isSigner: false
          }
        ],
        args: []
      },
      {
        name: "removeUser",
        accounts: [
          {
            name: "apa",
            isMut: true,
            isSigner: false
          },
          {
            name: "project",
            isMut: true,
            isSigner: false
          },
          {
            name: "escrow",
            isMut: true,
            isSigner: false
          },
          {
            name: "founder",
            isMut: true,
            isSigner: false
          },
          {
            name: "authority",
            isMut: true,
            isSigner: true
          },
          {
            name: "systemProgram",
            isMut: false,
            isSigner: false
          }
        ],
        args: []
      },
      {
        name: "initRole",
        accounts: [
          {
            name: "role",
            isMut: true,
            isSigner: false
          },
          {
            name: "founder",
            isMut: true,
            isSigner: false
          },
          {
            name: "project",
            isMut: true,
            isSigner: false
          },
          {
            name: "authority",
            isMut: true,
            isSigner: true
          },
          {
            name: "systemProgram",
            isMut: false,
            isSigner: false
          }
        ],
        args: [
          {
            name: "info",
            type: {
              defined: "RoleInfo"
            }
          }
        ]
      },
      {
        name: "apply",
        accounts: [
          {
            name: "apply",
            isMut: true,
            isSigner: false
          },
          {
            name: "role",
            isMut: true,
            isSigner: false
          },
          {
            name: "project",
            isMut: true,
            isSigner: false
          },
          {
            name: "user",
            isMut: true,
            isSigner: false
          },
          {
            name: "authority",
            isMut: true,
            isSigner: true
          },
          {
            name: "systemProgram",
            isMut: false,
            isSigner: false
          }
        ],
        args: [
          {
            name: "country",
            type: "string"
          },
          {
            name: "description",
            type: "string"
          },
          {
            name: "payment",
            type: "u64"
          }
        ]
      },
      {
        name: "rejectApply",
        accounts: [
          {
            name: "apply",
            isMut: true,
            isSigner: false
          },
          {
            name: "role",
            isMut: true,
            isSigner: false
          },
          {
            name: "founder",
            isMut: true,
            isSigner: false
          },
          {
            name: "project",
            isMut: true,
            isSigner: false
          },
          {
            name: "authority",
            isMut: true,
            isSigner: true
          },
          {
            name: "systemProgram",
            isMut: false,
            isSigner: false
          }
        ],
        args: []
      },
      {
        name: "approveApply",
        accounts: [
          {
            name: "apa",
            isMut: true,
            isSigner: false
          },
          {
            name: "apply",
            isMut: true,
            isSigner: false
          },
          {
            name: "role",
            isMut: true,
            isSigner: false
          },
          {
            name: "founder",
            isMut: true,
            isSigner: false
          },
          {
            name: "project",
            isMut: true,
            isSigner: false
          },
          {
            name: "user",
            isMut: true,
            isSigner: false
          },
          {
            name: "authority",
            isMut: true,
            isSigner: true
          },
          {
            name: "systemProgram",
            isMut: false,
            isSigner: false
          }
        ],
        args: []
      },
      {
        name: "closeRole",
        accounts: [
          {
            name: "role",
            isMut: true,
            isSigner: false
          },
          {
            name: "founder",
            isMut: true,
            isSigner: false
          },
          {
            name: "project",
            isMut: true,
            isSigner: false
          },
          {
            name: "authority",
            isMut: true,
            isSigner: true
          },
          {
            name: "systemProgram",
            isMut: false,
            isSigner: false
          }
        ],
        args: []
      },
      {
        name: "initEscrow",
        accounts: [
          {
            name: "escrow",
            isMut: true,
            isSigner: false
          },
          {
            name: "founder",
            isMut: true,
            isSigner: false
          },
          {
            name: "authority",
            isMut: true,
            isSigner: true
          },
          {
            name: "nexusEscrow",
            isMut: true,
            isSigner: false
          },
          {
            name: "systemProgram",
            isMut: false,
            isSigner: false
          }
        ],
        args: [
          {
            name: "info",
            type: {
              defined: "EscrowInfo"
            }
          }
        ]
      },
      {
        name: "fStartJob",
        accounts: [
          {
            name: "escrow",
            isMut: true,
            isSigner: false
          },
          {
            name: "reciever",
            isMut: true,
            isSigner: false
          },
          {
            name: "authority",
            isMut: true,
            isSigner: true
          },
          {
            name: "nexusEscrow",
            isMut: true,
            isSigner: false
          },
          {
            name: "systemProgram",
            isMut: false,
            isSigner: false
          }
        ],
        args: []
      },
      {
        name: "approve",
        accounts: [
          {
            name: "escrow",
            isMut: true,
            isSigner: false
          },
          {
            name: "reciever",
            isMut: true,
            isSigner: false
          },
          {
            name: "recieverAddress",
            isMut: true,
            isSigner: false
          },
          {
            name: "authority",
            isMut: true,
            isSigner: true
          },
          {
            name: "nexusEscrow",
            isMut: true,
            isSigner: false
          },
          {
            name: "systemProgram",
            isMut: false,
            isSigner: false
          }
        ],
        args: []
      },
      {
        name: "reject",
        accounts: [
          {
            name: "escrow",
            isMut: true,
            isSigner: false
          },
          {
            name: "authority",
            isMut: true,
            isSigner: true
          },
          {
            name: "systemProgram",
            isMut: false,
            isSigner: false
          }
        ],
        args: []
      },
      {
        name: "fTerminat",
        accounts: [
          {
            name: "escrow",
            isMut: true,
            isSigner: false
          },
          {
            name: "reciever",
            isMut: true,
            isSigner: false
          },
          {
            name: "authority",
            isMut: true,
            isSigner: true
          },
          {
            name: "systemProgram",
            isMut: false,
            isSigner: false
          }
        ],
        args: []
      },
      {
        name: "fOpenDispute",
        accounts: [
          {
            name: "escrow",
            isMut: true,
            isSigner: false
          },
          {
            name: "reciever",
            isMut: true,
            isSigner: false
          },
          {
            name: "authority",
            isMut: true,
            isSigner: true
          },
          {
            name: "systemProgram",
            isMut: false,
            isSigner: false
          }
        ],
        args: []
      },
      {
        name: "disputeSuccess",
        accounts: [
          {
            name: "escrow",
            isMut: true,
            isSigner: false
          },
          {
            name: "reciever",
            isMut: true,
            isSigner: false
          },
          {
            name: "recieverAddress",
            isMut: true,
            isSigner: false
          },
          {
            name: "authority",
            isMut: true,
            isSigner: true
          },
          {
            name: "nexusEscrow",
            isMut: true,
            isSigner: false
          },
          {
            name: "systemProgram",
            isMut: false,
            isSigner: false
          }
        ],
        args: []
      },
      {
        name: "disputeReject",
        accounts: [
          {
            name: "escrow",
            isMut: true,
            isSigner: false
          },
          {
            name: "authority",
            isMut: true,
            isSigner: true
          },
          {
            name: "systemProgram",
            isMut: false,
            isSigner: false
          }
        ],
        args: []
      },
      {
        name: "updateEscrow",
        accounts: [
          {
            name: "escrow",
            isMut: true,
            isSigner: false
          },
          {
            name: "founder",
            isMut: true,
            isSigner: false
          },
          {
            name: "authority",
            isMut: true,
            isSigner: true
          },
          {
            name: "systemProgram",
            isMut: false,
            isSigner: false
          }
        ],
        args: [
          {
            name: "info",
            type: {
              defined: "UpdateEscrowInfo"
            }
          }
        ]
      }
    ],
    accounts: [
      {
        name: "User",
        type: {
          kind: "struct",
          fields: [
            {
              name: "bump",
              type: "u8"
            },
            {
              name: "address",
              type: "publicKey"
            },
            {
              name: "nigotion",
              type: "bool"
            },
            {
              name: "paymentRatePerHour",
              type: "u64"
            },
            {
              name: "feature",
              type: "bool"
            },
            {
              name: "name",
              type: "string"
            },
            {
              name: "country",
              type: "string"
            },
            {
              name: "timezone",
              type: "string"
            },
            {
              name: "tosp",
              type: "string"
            },
            {
              name: "resume",
              type: "string"
            },
            {
              name: "portfolio",
              type: "string"
            },
            {
              name: "image",
              type: "string"
            },
            {
              name: "category",
              type: "string"
            },
            {
              name: "roles",
              type: "string"
            },
            {
              name: "levelOfExpertise",
              type: "string"
            },
            {
              name: "profileOverview",
              type: "string"
            },
            {
              name: "others",
              type: "string"
            },
            {
              name: "linkedin",
              type: "string"
            },
            {
              name: "twitter",
              type: "string"
            },
            {
              name: "website",
              type: "string"
            },
            {
              name: "discordId",
              type: "string"
            },
            {
              name: "telegramId",
              type: "string"
            }
          ]
        }
      },
      {
        name: "Project",
        type: {
          kind: "struct",
          fields: [
            {
              name: "bump",
              type: "u8"
            },
            {
              name: "founder",
              type: "publicKey"
            },
            {
              name: "hiring",
              type: "bool"
            },
            {
              name: "jobs",
              type: "u16"
            },
            {
              name: "members",
              type: "u16"
            },
            {
              name: "feature",
              type: "bool"
            },
            {
              name: "name",
              type: "string"
            },
            {
              name: "logo",
              type: "string"
            },
            {
              name: "linkThread",
              type: "string"
            },
            {
              name: "linkDiscord",
              type: "string"
            },
            {
              name: "linkWebsite",
              type: "string"
            },
            {
              name: "linkTwitter",
              type: "string"
            },
            {
              name: "category",
              type: "string"
            },
            {
              name: "chain",
              type: "string"
            },
            {
              name: "projectOverview",
              type: "string"
            },
            {
              name: "departments",
              type: "string"
            }
          ]
        }
      },
      {
        name: "Escrow",
        type: {
          kind: "struct",
          fields: [
            {
              name: "bump",
              type: "u8"
            },
            {
              name: "startAt",
              type: "i64"
            },
            {
              name: "founder",
              type: "publicKey"
            },
            {
              name: "deadline",
              type: "i64"
            },
            {
              name: "reciever",
              type: {
                "option": "publicKey"
              }
            },
            {
              name: "amount",
              type: "u64"
            },
            {
              name: "authority",
              type: "publicKey"
            },
            {
              name: "status",
              type: "u8"
            },
            {
              name: "contractName",
              type: "string"
            },
            {
              name: "materials",
              type: "string"
            },
            {
              name: "telegramLink",
              type: "string"
            },
            {
              name: "description",
              type: "string"
            }
          ]
        }
      },
      {
        name: "ApplyEscrow",
        type: {
          kind: "struct",
          fields: [
            {
              name: "bump",
              type: "u8"
            },
            {
              name: "escrow",
              type: "publicKey"
            },
            {
              name: "founder",
              type: "publicKey"
            },
            {
              name: "user",
              type: "publicKey"
            },
            {
              name: "authority",
              type: "publicKey"
            },
            {
              name: "userName",
              type: "string"
            },
            {
              name: "status",
              type: "string"
            },
            {
              name: "role",
              type: "string"
            },
            {
              name: "description",
              type: "string"
            }
          ]
        }
      },
      {
        name: "Invt",
        type: {
          kind: "struct",
          fields: [
            {
              name: "bump",
              type: "u8"
            },
            {
              name: "project",
              type: "publicKey"
            },
            {
              name: "user",
              type: "publicKey"
            },
            {
              name: "status",
              type: "u8"
            },
            {
              name: "role",
              type: "string"
            },
            {
              name: "name",
              type: "string"
            },
            {
              name: "projectDescription",
              type: "string"
            }
          ]
        }
      },
      {
        name: "APA",
        type: {
          kind: "struct",
          fields: [
            {
              name: "user",
              type: "publicKey"
            },
            {
              name: "bump",
              type: "u8"
            },
            {
              name: "project",
              type: "publicKey"
            },
            {
              name: "address",
              type: "publicKey"
            },
            {
              name: "name",
              type: "string"
            },
            {
              name: "role",
              type: "string"
            },
            {
              name: "projectName",
              type: "string"
            },
            {
              name: "projectRole",
              type: "string"
            }
          ]
        }
      },
      {
        name: "Role",
        type: {
          kind: "struct",
          fields: [
            {
              name: "bump",
              type: "u8"
            },
            {
              name: "payment",
              type: "u64"
            },
            {
              name: "time",
              type: "i64"
            },
            {
              name: "project",
              type: "publicKey"
            },
            {
              name: "user",
              type: "publicKey"
            },
            {
              name: "name",
              type: "string"
            },
            {
              name: "role",
              type: "string"
            },
            {
              name: "levelOfExperience",
              type: "string"
            },
            {
              name: "country",
              type: "string"
            },
            {
              name: "description",
              type: "string"
            }
          ]
        }
      },
      {
        name: "Apply",
        type: {
          kind: "struct",
          fields: [
            {
              name: "bump",
              type: "u8"
            },
            {
              name: "payment",
              type: "u64"
            },
            {
              name: "time",
              type: "i64"
            },
            {
              name: "rolePubkey",
              type: "publicKey"
            },
            {
              name: "project",
              type: "publicKey"
            },
            {
              name: "user",
              type: "publicKey"
            },
            {
              name: "name",
              type: "string"
            },
            {
              name: "role",
              type: "string"
            },
            {
              name: "levelOfExperience",
              type: "string"
            },
            {
              name: "country",
              type: "string"
            },
            {
              name: "description",
              type: "string"
            }
          ]
        }
      },
      {
        name: "Identifier",
        type: {
          kind: "struct",
          fields: [
            {
              name: "bump",
              type: "u8"
            },
            {
              name: "count",
              type: "u64"
            }
          ]
        }
      }
    ],
    types: [
      {
        name: "EscrowInfo",
        type: {
          kind: "struct",
          fields: [
            {
              name: "contractName",
              type: "string"
            },
            {
              name: "deadline",
              type: "i64"
            },
            {
              name: "amount",
              type: "u64"
            },
            {
              name: "telegramLink",
              type: "string"
            },
            {
              name: "materials",
              type: "string"
            },
            {
              name: "description",
              type: "string"
            }
          ]
        }
      },
      {
        name: "UpdateEscrowInfo",
        type: {
          kind: "struct",
          fields: [
            {
              name: "deadline",
              type: "i64"
            }
          ]
        }
      },
      {
        name: "ProjectInfo",
        type: {
          kind: "struct",
          fields: [
            {
              name: "name",
              type: "string"
            },
            {
              name: "logo",
              type: "string"
            },
            {
              name: "linkDiscord",
              type: "string"
            },
            {
              name: "linkThread",
              type: "string"
            },
            {
              name: "linkWebsite",
              type: "string"
            },
            {
              name: "linkTwitter",
              type: "string"
            },
            {
              name: "category",
              type: "string"
            },
            {
              name: "projectOverview",
              type: "string"
            },
            {
              name: "hiring",
              type: "bool"
            },
            {
              name: "departments",
              type: "string"
            }
          ]
        }
      },
      {
        name: "RoleInfo",
        type: {
          kind: "struct",
          fields: [
            {
              name: "time",
              type: "i64"
            },
            {
              name: "payment",
              type: "u64"
            },
            {
              name: "role",
              type: "string"
            },
            {
              name: "levelOfExperience",
              type: "string"
            },
            {
              name: "description",
              type: "string"
            },
            {
              name: "country",
              type: "string"
            }
          ]
        }
      },
      {
        name: "UpdateProjectInfo",
        type: {
          kind: "struct",
          fields: [
            {
              name: "logo",
              type: "string"
            },
            {
              name: "linkDiscord",
              type: "string"
            },
            {
              name: "linkThread",
              type: "string"
            },
            {
              name: "linkWebsite",
              type: "string"
            },
            {
              name: "linkTwitter",
              type: "string"
            },
            {
              name: "category",
              type: "string"
            },
            {
              name: "projectOverview",
              type: "string"
            },
            {
              name: "departments",
              type: "string"
            },
            {
              name: "hiring",
              type: "bool"
            }
          ]
        }
      },
      {
        name: "UserInfo",
        type: {
          kind: "struct",
          fields: [
            {
              name: "nigotion",
              type: "bool"
            },
            {
              name: "paymentRatePerHour",
              type: "u64"
            },
            {
              name: "name",
              type: "string"
            },
            {
              name: "country",
              type: "string"
            },
            {
              name: "timezone",
              type: "string"
            },
            {
              name: "tosp",
              type: "string"
            },
            {
              name: "resume",
              type: "string"
            },
            {
              name: "portfolio",
              type: "string"
            },
            {
              name: "image",
              type: "string"
            },
            {
              name: "category",
              type: "string"
            },
            {
              name: "roles",
              type: "string"
            },
            {
              name: "levelOfExpertise",
              type: "string"
            },
            {
              name: "profileOverview",
              type: "string"
            },
            {
              name: "others",
              type: "string"
            }
          ]
        }
      },
      {
        name: "UpdateUserInfo",
        type: {
          kind: "struct",
          fields: [
            {
              name: "name",
              type: "string"
            },
            {
              name: "image",
              type: "string"
            },
            {
              name: "category",
              type: "string"
            },
            {
              name: "roles",
              type: "string"
            },
            {
              name: "levelOfExpertise",
              type: "string"
            },
            {
              name: "paymentRatePerHour",
              type: "u64"
            },
            {
              name: "profileOverview",
              type: "string"
            },
            {
              name: "nigotion",
              type: "bool"
            },
            {
              name: "others",
              type: "string"
            },
            {
              name: "linkedin",
              type: "string"
            },
            {
              name: "twitter",
              type: "string"
            },
            {
              name: "website",
              type: "string"
            },
            {
              name: "discordId",
              type: "string"
            },
            {
              name: "telegramId",
              type: "string"
            },
            {
              name: "resume",
              type: "string"
            },
            {
              name: "portfolio",
              type: "string"
            }
          ]
        }
      }
    ],
    errors: [
      {
        code: 6000,
        name: "PublicKeyMismatch",
        msg: "PublicKey Mismatch!"
      },
      {
        code: 6001,
        name: "Uninitialized",
        msg: "Uninitialized!"
      },
      {
        code: 6002,
        name: "InvalidCalculation",
        msg: "Invalid calculation"
      },
      {
        code: 6003,
        name: "TimeEnd",
        msg: "Time End!"
      },
      {
        code: 6004,
        name: "WrongStats",
        msg: "Wrong Stats!"
      }
    ],
    metadata: {
      address: "3GKGywaDKPQ6LKXgrEvBxLAdw6Tt8PvGibbBREKhYDfD"
    }
  }

export const IDL: CardinalStakePool =
{
  version: "0.1.0",
  name: "nexus",
  instructions: [
    {
      name: "initUser",
      accounts: [
        {
          name: "user",
          isMut: true,
          isSigner: false
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: "info",
          type: {
            defined: "UserInfo"
          }
        }
      ]
    },
    {
      name: "updateUser",
      accounts: [
        {
          name: "user",
          isMut: true,
          isSigner: false
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: "info",
          type: {
            defined: "UpdateUserInfo"
          }
        }
      ]
    },
    {
      name: "closeUser",
      accounts: [
        {
          name: "user",
          isMut: true,
          isSigner: false
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: "initProject",
      accounts: [
        {
          name: "project",
          isMut: true,
          isSigner: false
        },
        {
          name: "founder",
          isMut: true,
          isSigner: false
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: "info",
          type: {
            defined: "ProjectInfo"
          }
        }
      ]
    },
    {
      name: "updateProject",
      accounts: [
        {
          name: "project",
          isMut: true,
          isSigner: false
        },
        {
          name: "founder",
          isMut: true,
          isSigner: false
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: "info",
          type: {
            defined: "UpdateProjectInfo"
          }
        }
      ]
    },
    {
      name: "initInvitation",
      accounts: [
        {
          name: "invitation",
          isMut: true,
          isSigner: false
        },
        {
          name: "project",
          isMut: true,
          isSigner: false
        },
        {
          name: "founder",
          isMut: true,
          isSigner: false
        },
        {
          name: "user",
          isMut: true,
          isSigner: false
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: "role",
          type: "string"
        }
      ]
    },
    {
      name: "acceptInvt",
      accounts: [
        {
          name: "apa",
          isMut: true,
          isSigner: false
        },
        {
          name: "invitation",
          isMut: true,
          isSigner: false
        },
        {
          name: "project",
          isMut: true,
          isSigner: false
        },
        {
          name: "user",
          isMut: true,
          isSigner: false
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: "refuseInvt",
      accounts: [
        {
          name: "invitation",
          isMut: true,
          isSigner: false
        },
        {
          name: "project",
          isMut: false,
          isSigner: false
        },
        {
          name: "user",
          isMut: true,
          isSigner: false
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: "removeUser",
      accounts: [
        {
          name: "apa",
          isMut: true,
          isSigner: false
        },
        {
          name: "project",
          isMut: true,
          isSigner: false
        },
        {
          name: "escrow",
          isMut: true,
          isSigner: false
        },
        {
          name: "founder",
          isMut: true,
          isSigner: false
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: "initRole",
      accounts: [
        {
          name: "role",
          isMut: true,
          isSigner: false
        },
        {
          name: "founder",
          isMut: true,
          isSigner: false
        },
        {
          name: "project",
          isMut: true,
          isSigner: false
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: "info",
          type: {
            defined: "RoleInfo"
          }
        }
      ]
    },
    {
      name: "apply",
      accounts: [
        {
          name: "apply",
          isMut: true,
          isSigner: false
        },
        {
          name: "role",
          isMut: true,
          isSigner: false
        },
        {
          name: "project",
          isMut: true,
          isSigner: false
        },
        {
          name: "user",
          isMut: true,
          isSigner: false
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: "country",
          type: "string"
        },
        {
          name: "description",
          type: "string"
        },
        {
          name: "payment",
          type: "u64"
        }
      ]
    },
    {
      name: "rejectApply",
      accounts: [
        {
          name: "apply",
          isMut: true,
          isSigner: false
        },
        {
          name: "role",
          isMut: true,
          isSigner: false
        },
        {
          name: "founder",
          isMut: true,
          isSigner: false
        },
        {
          name: "project",
          isMut: true,
          isSigner: false
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: "approveApply",
      accounts: [
        {
          name: "apa",
          isMut: true,
          isSigner: false
        },
        {
          name: "apply",
          isMut: true,
          isSigner: false
        },
        {
          name: "role",
          isMut: true,
          isSigner: false
        },
        {
          name: "founder",
          isMut: true,
          isSigner: false
        },
        {
          name: "project",
          isMut: true,
          isSigner: false
        },
        {
          name: "user",
          isMut: true,
          isSigner: false
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: "closeRole",
      accounts: [
        {
          name: "role",
          isMut: true,
          isSigner: false
        },
        {
          name: "founder",
          isMut: true,
          isSigner: false
        },
        {
          name: "project",
          isMut: true,
          isSigner: false
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: "initEscrow",
      accounts: [
        {
          name: "escrow",
          isMut: true,
          isSigner: false
        },
        {
          name: "founder",
          isMut: true,
          isSigner: false
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true
        },
        {
          name: "nexusEscrow",
          isMut: true,
          isSigner: false
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: "info",
          type: {
            defined: "EscrowInfo"
          }
        }
      ]
    },
    {
      name: "fStartJob",
      accounts: [
        {
          name: "escrow",
          isMut: true,
          isSigner: false
        },
        {
          name: "reciever",
          isMut: true,
          isSigner: false
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true
        },
        {
          name: "nexusEscrow",
          isMut: true,
          isSigner: false
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: "approve",
      accounts: [
        {
          name: "escrow",
          isMut: true,
          isSigner: false
        },
        {
          name: "reciever",
          isMut: true,
          isSigner: false
        },
        {
          name: "recieverAddress",
          isMut: true,
          isSigner: false
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true
        },
        {
          name: "nexusEscrow",
          isMut: true,
          isSigner: false
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: "reject",
      accounts: [
        {
          name: "escrow",
          isMut: true,
          isSigner: false
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: "fTerminat",
      accounts: [
        {
          name: "escrow",
          isMut: true,
          isSigner: false
        },
        {
          name: "reciever",
          isMut: true,
          isSigner: false
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: "fOpenDispute",
      accounts: [
        {
          name: "escrow",
          isMut: true,
          isSigner: false
        },
        {
          name: "reciever",
          isMut: true,
          isSigner: false
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: "disputeSuccess",
      accounts: [
        {
          name: "escrow",
          isMut: true,
          isSigner: false
        },
        {
          name: "reciever",
          isMut: true,
          isSigner: false
        },
        {
          name: "recieverAddress",
          isMut: true,
          isSigner: false
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true
        },
        {
          name: "nexusEscrow",
          isMut: true,
          isSigner: false
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: "disputeReject",
      accounts: [
        {
          name: "escrow",
          isMut: true,
          isSigner: false
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: "updateEscrow",
      accounts: [
        {
          name: "escrow",
          isMut: true,
          isSigner: false
        },
        {
          name: "founder",
          isMut: true,
          isSigner: false
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: "info",
          type: {
            defined: "UpdateEscrowInfo"
          }
        }
      ]
    }
  ],
  accounts: [
    {
      name: "User",
      type: {
        kind: "struct",
        fields: [
          {
            name: "bump",
            type: "u8"
          },
          {
            name: "address",
            type: "publicKey"
          },
          {
            name: "nigotion",
            type: "bool"
          },
          {
            name: "paymentRatePerHour",
            type: "u64"
          },
          {
            name: "feature",
            type: "bool"
          },
          {
            name: "name",
            type: "string"
          },
          {
            name: "country",
            type: "string"
          },
          {
            name: "timezone",
            type: "string"
          },
          {
            name: "tosp",
            type: "string"
          },
          {
            name: "resume",
            type: "string"
          },
          {
            name: "portfolio",
            type: "string"
          },
          {
            name: "image",
            type: "string"
          },
          {
            name: "category",
            type: "string"
          },
          {
            name: "roles",
            type: "string"
          },
          {
            name: "levelOfExpertise",
            type: "string"
          },
          {
            name: "profileOverview",
            type: "string"
          },
          {
            name: "others",
            type: "string"
          },
          {
            name: "linkedin",
            type: "string"
          },
          {
            name: "twitter",
            type: "string"
          },
          {
            name: "website",
            type: "string"
          },
          {
            name: "discordId",
            type: "string"
          },
          {
            name: "telegramId",
            type: "string"
          }
        ]
      }
    },
    {
      name: "Project",
      type: {
        kind: "struct",
        fields: [
          {
            name: "bump",
            type: "u8"
          },
          {
            name: "founder",
            type: "publicKey"
          },
          {
            name: "hiring",
            type: "bool"
          },
          {
            name: "jobs",
            type: "u16"
          },
          {
            name: "members",
            type: "u16"
          },
          {
            name: "feature",
            type: "bool"
          },
          {
            name: "name",
            type: "string"
          },
          {
            name: "logo",
            type: "string"
          },
          {
            name: "linkThread",
            type: "string"
          },
          {
            name: "linkDiscord",
            type: "string"
          },
          {
            name: "linkWebsite",
            type: "string"
          },
          {
            name: "linkTwitter",
            type: "string"
          },
          {
            name: "category",
            type: "string"
          },
          {
            name: "chain",
            type: "string"
          },
          {
            name: "projectOverview",
            type: "string"
          },
          {
            name: "departments",
            type: "string"
          }
        ]
      }
    },
    {
      name: "Escrow",
      type: {
        kind: "struct",
        fields: [
          {
            name: "bump",
            type: "u8"
          },
          {
            name: "startAt",
            type: "i64"
          },
          {
            name: "founder",
            type: "publicKey"
          },
          {
            name: "deadline",
            type: "i64"
          },
          {
            name: "reciever",
            type: {
              "option": "publicKey"
            }
          },
          {
            name: "amount",
            type: "u64"
          },
          {
            name: "authority",
            type: "publicKey"
          },
          {
            name: "status",
            type: "u8"
          },
          {
            name: "contractName",
            type: "string"
          },
          {
            name: "materials",
            type: "string"
          },
          {
            name: "telegramLink",
            type: "string"
          },
          {
            name: "description",
            type: "string"
          }
        ]
      }
    },
    {
      name: "ApplyEscrow",
      type: {
        kind: "struct",
        fields: [
          {
            name: "bump",
            type: "u8"
          },
          {
            name: "escrow",
            type: "publicKey"
          },
          {
            name: "founder",
            type: "publicKey"
          },
          {
            name: "user",
            type: "publicKey"
          },
          {
            name: "authority",
            type: "publicKey"
          },
          {
            name: "userName",
            type: "string"
          },
          {
            name: "status",
            type: "string"
          },
          {
            name: "role",
            type: "string"
          },
          {
            name: "description",
            type: "string"
          }
        ]
      }
    },
    {
      name: "Invt",
      type: {
        kind: "struct",
        fields: [
          {
            name: "bump",
            type: "u8"
          },
          {
            name: "project",
            type: "publicKey"
          },
          {
            name: "user",
            type: "publicKey"
          },
          {
            name: "status",
            type: "u8"
          },
          {
            name: "role",
            type: "string"
          },
          {
            name: "name",
            type: "string"
          },
          {
            name: "projectDescription",
            type: "string"
          }
        ]
      }
    },
    {
      name: "APA",
      type: {
        kind: "struct",
        fields: [
          {
            name: "user",
            type: "publicKey"
          },
          {
            name: "bump",
            type: "u8"
          },
          {
            name: "project",
            type: "publicKey"
          },
          {
            name: "address",
            type: "publicKey"
          },
          {
            name: "name",
            type: "string"
          },
          {
            name: "role",
            type: "string"
          },
          {
            name: "projectName",
            type: "string"
          },
          {
            name: "projectRole",
            type: "string"
          }
        ]
      }
    },
    {
      name: "Role",
      type: {
        kind: "struct",
        fields: [
          {
            name: "bump",
            type: "u8"
          },
          {
            name: "payment",
            type: "u64"
          },
          {
            name: "time",
            type: "i64"
          },
          {
            name: "project",
            type: "publicKey"
          },
          {
            name: "user",
            type: "publicKey"
          },
          {
            name: "name",
            type: "string"
          },
          {
            name: "role",
            type: "string"
          },
          {
            name: "levelOfExperience",
            type: "string"
          },
          {
            name: "country",
            type: "string"
          },
          {
            name: "description",
            type: "string"
          }
        ]
      }
    },
    {
      name: "Apply",
      type: {
        kind: "struct",
        fields: [
          {
            name: "bump",
            type: "u8"
          },
          {
            name: "payment",
            type: "u64"
          },
          {
            name: "time",
            type: "i64"
          },
          {
            name: "rolePubkey",
            type: "publicKey"
          },
          {
            name: "project",
            type: "publicKey"
          },
          {
            name: "user",
            type: "publicKey"
          },
          {
            name: "name",
            type: "string"
          },
          {
            name: "role",
            type: "string"
          },
          {
            name: "levelOfExperience",
            type: "string"
          },
          {
            name: "country",
            type: "string"
          },
          {
            name: "description",
            type: "string"
          }
        ]
      }
    },
    {
      name: "Identifier",
      type: {
        kind: "struct",
        fields: [
          {
            name: "bump",
            type: "u8"
          },
          {
            name: "count",
            type: "u64"
          }
        ]
      }
    }
  ],
  types: [
    {
      name: "EscrowInfo",
      type: {
        kind: "struct",
        fields: [
          {
            name: "contractName",
            type: "string"
          },
          {
            name: "deadline",
            type: "i64"
          },
          {
            name: "amount",
            type: "u64"
          },
          {
            name: "telegramLink",
            type: "string"
          },
          {
            name: "materials",
            type: "string"
          },
          {
            name: "description",
            type: "string"
          }
        ]
      }
    },
    {
      name: "UpdateEscrowInfo",
      type: {
        kind: "struct",
        fields: [
          {
            name: "deadline",
            type: "i64"
          }
        ]
      }
    },
    {
      name: "ProjectInfo",
      type: {
        kind: "struct",
        fields: [
          {
            name: "name",
            type: "string"
          },
          {
            name: "logo",
            type: "string"
          },
          {
            name: "linkDiscord",
            type: "string"
          },
          {
            name: "linkThread",
            type: "string"
          },
          {
            name: "linkWebsite",
            type: "string"
          },
          {
            name: "linkTwitter",
            type: "string"
          },
          {
            name: "category",
            type: "string"
          },
          {
            name: "projectOverview",
            type: "string"
          },
          {
            name: "hiring",
            type: "bool"
          },
          {
            name: "departments",
            type: "string"
          }
        ]
      }
    },
    {
      name: "RoleInfo",
      type: {
        kind: "struct",
        fields: [
          {
            name: "time",
            type: "i64"
          },
          {
            name: "payment",
            type: "u64"
          },
          {
            name: "role",
            type: "string"
          },
          {
            name: "levelOfExperience",
            type: "string"
          },
          {
            name: "description",
            type: "string"
          },
          {
            name: "country",
            type: "string"
          }
        ]
      }
    },
    {
      name: "UpdateProjectInfo",
      type: {
        kind: "struct",
        fields: [
          {
            name: "logo",
            type: "string"
          },
          {
            name: "linkDiscord",
            type: "string"
          },
          {
            name: "linkThread",
            type: "string"
          },
          {
            name: "linkWebsite",
            type: "string"
          },
          {
            name: "linkTwitter",
            type: "string"
          },
          {
            name: "category",
            type: "string"
          },
          {
            name: "projectOverview",
            type: "string"
          },
          {
            name: "departments",
            type: "string"
          },
          {
            name: "hiring",
            type: "bool"
          }
        ]
      }
    },
    {
      name: "UserInfo",
      type: {
        kind: "struct",
        fields: [
          {
            name: "nigotion",
            type: "bool"
          },
          {
            name: "paymentRatePerHour",
            type: "u64"
          },
          {
            name: "name",
            type: "string"
          },
          {
            name: "country",
            type: "string"
          },
          {
            name: "timezone",
            type: "string"
          },
          {
            name: "tosp",
            type: "string"
          },
          {
            name: "resume",
            type: "string"
          },
          {
            name: "portfolio",
            type: "string"
          },
          {
            name: "image",
            type: "string"
          },
          {
            name: "category",
            type: "string"
          },
          {
            name: "roles",
            type: "string"
          },
          {
            name: "levelOfExpertise",
            type: "string"
          },
          {
            name: "profileOverview",
            type: "string"
          },
          {
            name: "others",
            type: "string"
          }
        ]
      }
    },
    {
      name: "UpdateUserInfo",
      type: {
        kind: "struct",
        fields: [
          {
            name: "name",
            type: "string"
          },
          {
            name: "image",
            type: "string"
          },
          {
            name: "category",
            type: "string"
          },
          {
            name: "roles",
            type: "string"
          },
          {
            name: "levelOfExpertise",
            type: "string"
          },
          {
            name: "paymentRatePerHour",
            type: "u64"
          },
          {
            name: "profileOverview",
            type: "string"
          },
          {
            name: "nigotion",
            type: "bool"
          },
          {
            name: "others",
            type: "string"
          },
          {
            name: "linkedin",
            type: "string"
          },
          {
            name: "twitter",
            type: "string"
          },
          {
            name: "website",
            type: "string"
          },
          {
            name: "discordId",
            type: "string"
          },
          {
            name: "telegramId",
            type: "string"
          },
          {
            name: "resume",
            type: "string"
          },
          {
            name: "portfolio",
            type: "string"
          }
        ]
      }
    }
  ],
  errors: [
    {
      code: 6000,
      name: "PublicKeyMismatch",
      msg: "PublicKey Mismatch!"
    },
    {
      code: 6001,
      name: "Uninitialized",
      msg: "Uninitialized!"
    },
    {
      code: 6002,
      name: "InvalidCalculation",
      msg: "Invalid calculation"
    },
    {
      code: 6003,
      name: "TimeEnd",
      msg: "Time End!"
    },
    {
      code: 6004,
      name: "WrongStats",
      msg: "Wrong Stats!"
    }
  ],
  metadata: {
    address: "3GKGywaDKPQ6LKXgrEvBxLAdw6Tt8PvGibbBREKhYDfD"
  }
}