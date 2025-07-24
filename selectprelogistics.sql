-- TABLES --

/****** Object:  Table [dbo].[FAC_Facility]    Script Date: 5/29/2025 6:51:44 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[FAC_Facility](
	[ID] [int] IDENTITY(1,1) NOT FOR REPLICATION NOT NULL,
	[BuildingTypeID] [int] NOT NULL,
	[FacilityStatusID] [int] NOT NULL,
	[FacilityAccessibilityID] [int] NOT NULL,
	[CountyID] [int] NOT NULL,
	[Tract] [decimal](18, 2) NULL,
	[Block] [int] NULL,
	[IsDOJApproved] [char](1) NOT NULL,
	[IsPaid] [char](1) NOT NULL,
	[CSD] [int] NULL,
	[PolicePrecinctID] [int] NOT NULL,
	[SiteNumber] [varchar](7) NOT NULL,
	[FacilityName] [varchar](60) NOT NULL,
	[ClosestPhone] [varchar](25) NULL,
	[HouseNumber] [varchar](15) NOT NULL,
	[StreetName] [varchar](50) NOT NULL,
	[City] [varchar](25) NOT NULL,
	[State] [char](2) NOT NULL,
	[ZipCode] [varchar](12) NOT NULL,
	[ZoneID] [int] NULL,
	[MAddress1] [varchar](60) NOT NULL,
	[MAddress2] [varchar](60) NULL,
	[MCity] [varchar](25) NOT NULL,
	[MState] [char](2) NOT NULL,
	[MZipCode] [varchar](12) NOT NULL,
	[OnSitePhoneNumber] [varchar](17) NULL,
	[ParkingFacility] [char](1) NOT NULL,
	[HasHandicapSpaces] [char](1) NOT NULL,
	[CancelDate] [datetime] NULL,
	[CancelReason] [varchar](255) NULL,
	[AlternativeEventPayment] [char](1) NOT NULL,
	[IsReady] [char](1) NOT NULL,
	[Comments] [varchar](255) NULL,
	[PollWorkerComments] [varchar](255) NULL,
	[CreatedBy] [int] NOT NULL,
	[Created] [datetime] NOT NULL,
	[ModifiedBy] [int] NULL,
	[Modified] [datetime] NULL,
	[Latitude] [decimal](18, 6) NULL,
	[Longitude] [decimal](18, 6) NULL,
	[RequirementsReviewed] [varchar](100) NULL,
	[SchoolBuildingID] [varchar](50) NULL,
	[BuildingOwnerID] [int] NULL,
	[TaxAbatement] [varchar](25) NULL,
	[HasTaxAbatement] [bit] NOT NULL,
	[OwnershipType] [varchar](10) NULL,
	[RampInstallZone] [varchar](50) NULL,
	[BuildingID] [varchar](50) NULL,
	[ETAFinalDTTM] [datetime] NULL,
	[ETAStatusID] [int] NULL,
 CONSTRAINT [PK_Facility] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

/****** Object:  Table [dbo].[LOG_ActivityLog]    Script Date: 5/29/2025 6:51:44 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[LOG_ActivityLog](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[LogDTTM] [datetime] NOT NULL,
	[UserID] [int] NOT NULL,
	[ModuleID] [int] NOT NULL,
	[FunctionID] [int] NULL,
	[TableID] [int] NULL,
	[RecordID] [int] NULL,
	[TextRecordID] [varchar](10) NULL,
	[ActivityTypeID] [int] NULL,
	[ActivityDescription] [varchar](255) NOT NULL,
	[PreviousText] [nvarchar](4000) NULL,
	[NewText] [nvarchar](4000) NULL,
 CONSTRAINT [PK_LOG_ActivityLog] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

-- INDEXES for FAC_Facility (Example) --
/****** Object:  Index [IX_Facility_CountyID]    Script Date: 5/29/2025 6:51:45 AM ******/
CREATE NONCLUSTERED INDEX [IX_Facility_CountyID] ON [dbo].[FAC_Facility]
(
	[CountyID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Facility_SiteNumber]    Script Date: 5/29/2025 6:51:45 AM ******/
CREATE UNIQUE NONCLUSTERED INDEX [IX_Facility_SiteNumber] ON [dbo].[FAC_Facility]
(
	[SiteNumber] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

-- CONSTRAINTS for FAC_Facility (Example) --
ALTER TABLE [dbo].[FAC_Facility]  WITH NOCHECK ADD  CONSTRAINT [FK_Facility_BuildingOwner] FOREIGN KEY([BuildingOwnerID])
REFERENCES [dbo].[BuildingOwner] ([ID])
GO
ALTER TABLE [dbo].[FAC_Facility] CHECK CONSTRAINT [FK_Facility_BuildingOwner]
GO
ALTER TABLE [dbo].[FAC_Facility]  WITH CHECK ADD  CONSTRAINT [FK_Facility_BuildingType] FOREIGN KEY([BuildingTypeID])
REFERENCES [dbo].[BuildingType] ([ID])
GO
ALTER TABLE [dbo].[FAC_Facility] CHECK CONSTRAINT [FK_Facility_BuildingType]
GO
ALTER TABLE [dbo].[FAC_Facility]  WITH CHECK ADD  CONSTRAINT [FK_Facility_ETAStatus] FOREIGN KEY([ETAStatusID])
REFERENCES [dbo].[ETAStatus] ([ID])
GO
ALTER TABLE [dbo].[FAC_Facility] CHECK CONSTRAINT [FK_Facility_ETAStatus]
GO
ALTER TABLE [dbo].[FAC_Facility]  WITH CHECK ADD  CONSTRAINT [FK_Facility_FacilityAccessibility] FOREIGN KEY([FacilityAccessibilityID])
REFERENCES [dbo].[FacilityAccessibility] ([ID])
GO
ALTER TABLE [dbo].[FAC_Facility] CHECK CONSTRAINT [FK_Facility_FacilityAccessibility]
GO
ALTER TABLE [dbo].[FAC_Facility]  WITH CHECK ADD  CONSTRAINT [FK_Facility_FacilityStatus] FOREIGN KEY([FacilityStatusID])
REFERENCES [dbo].[FacilityStatus] ([ID])
GO
ALTER TABLE [dbo].[FAC_Facility] CHECK CONSTRAINT [FK_Facility_FacilityStatus]
GO
ALTER TABLE [dbo].[FAC_Facility]  WITH CHECK ADD  CONSTRAINT [FK_Facility_PolicePrecinct] FOREIGN KEY([PolicePrecinctID])
REFERENCES [dbo].[PolicePrecinct] ([ID])
GO
ALTER TABLE [dbo].[FAC_Facility] CHECK CONSTRAINT [FK_Facility_PolicePrecinct]
GO
ALTER TABLE [dbo].[FAC_Facility]  WITH CHECK ADD  CONSTRAINT [FK_Facility_PoliticalDistrict] FOREIGN KEY([CountyID])
REFERENCES [dbo].[PoliticalDistrict] ([ID])
GO
ALTER TABLE [dbo].[FAC_Facility] CHECK CONSTRAINT [FK_Facility_PoliticalDistrict]
GO
ALTER TABLE [dbo].[FAC_Facility]  WITH CHECK ADD  CONSTRAINT [FK_Facility_Zone] FOREIGN KEY([ZoneID])
REFERENCES [dbo].[Zone] ([ID])
GO
ALTER TABLE [dbo].[FAC_Facility] CHECK CONSTRAINT [FK_Facility_Zone]
GO
ALTER TABLE [dbo].[FAC_Facility] ADD  CONSTRAINT [DF_Facility_HasTaxAbatement]  DEFAULT ((0)) FOR [HasTaxAbatement]
GO
ALTER TABLE [dbo].[FAC_Facility] ADD  CONSTRAINT [DF_Facility_IsReady]  DEFAULT ('N') FOR [IsReady]
GO


-- STORED PROCEDURES --

/****** Object:  StoredProcedure [dbo].[spAddUpdateFacility]    Script Date: 5/29/2025 6:51:46 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[spAddUpdateFacility]
	@BuildingTypeID int,
	@FacilityStatusID int,
	@FacilityAccessibilityID int,
	@CountyID int,
	@Tract decimal(18,2)=null,
	@Block int=null,
	@IsDOJApproved char(1)='Y',
	@IsPaid char(1)='Y',
	@CSD int=null,
	@PolicePrecinctID int,
	@SiteNumber varchar(7),
	@FacilityName varchar(60),
	@ClosestPhone varchar(25)=null,
	@HouseNumber varchar(15),
	@StreetName varchar(50),
	@City varchar(25),
	@State char(2),
	@ZipCode varchar(12),
	@ZoneID int=null,
	@MAddress1 varchar(60),
	@MAddress2 varchar(60)=null,
	@MCity varchar(25),
	@MState char(2),
	@MZipCode varchar(12),
	@OnSitePhoneNumber varchar(17)=null,
	@ParkingFacility char(1)='N',
	@HasHandicapSpaces char(1)='N',
	@CancelDate datetime=null,
	@CancelReason varchar(255)=null,
	@AlternativeEventPayment char(1)='N',
	@IsReady char(1)='Y',
	@Comments varchar(255)=null,
	@PollWorkerComments varchar(255)=null,
	@UserID int,
	@Latitude decimal(18,6)=NULL,
	@Longitude decimal(18,6)=NULL,
	@RequirementsReviewed varchar(100)=NULL,
	@SchoolBuildingID VARCHAR(50)=NULL,
	@BuildingOwnerID INT=NULL,
	@TaxAbatement VARCHAR(25)=NULL,
	@HasTaxAbatement BIT=0,
	@OwnershipType VARCHAR(10)=NULL,
	@RampInstallZone VARCHAR(50)=NULL,
	@BuildingID VARCHAR(50)=NULL,
	@ID int=null output

AS

If @ID=0 OR @ID IS NULL
Begin
	BEGIN TRAN
	INSERT INTO [Facility]
           ([BuildingTypeID]
           ,[FacilityStatusID]
           ,[FacilityAccessibilityID]
           ,[CountyID]
           ,[Tract]
           ,[Block]
           ,[IsDOJApproved]
           ,[IsPaid]
           ,[CSD]
           ,[PolicePrecinctID]
           ,[SiteNumber]
           ,[FacilityName]
           ,[ClosestPhone]
           ,[HouseNumber]
           ,[StreetName]
           ,[City]
           ,[State]
           ,[ZipCode]
           ,[ZoneID]
           ,[MAddress1]
           ,[MAddress2]
           ,[MCity]
           ,[MState]
           ,[MZipCode]
           ,[OnSitePhoneNumber]
           ,[ParkingFacility]
           ,[HasHandicapSpaces]
           ,[CancelDate]
           ,[CancelReason]
           ,[AlternativeEventPayment]
           ,[IsReady]
           ,[Comments]
           ,[PollWorkerComments]
           ,[CreatedBy]
           ,[Created]
		   ,[Latitude]
		   ,[Longitude]
		   ,[RequirementsReviewed]
		   ,[SchoolBuildingID]
		   ,[BuildingOwnerID]
		   ,[TaxAbatement]
		   ,[HasTaxAbatement]
		   ,[OwnershipType]
		   ,[RampInstallZone]
		   ,[BuildingID])
     VALUES
           (@BuildingTypeID
           ,@FacilityStatusID
           ,@FacilityAccessibilityID
           ,@CountyID
           ,@Tract
           ,@Block
           ,@IsDOJApproved
           ,@IsPaid
           ,@CSD
           ,@PolicePrecinctID
           ,@SiteNumber
           ,@FacilityName
           ,@ClosestPhone
           ,@HouseNumber
           ,@StreetName
           ,@City
           ,@State
           ,@ZipCode
           ,@ZoneID
           ,@MAddress1
           ,@MAddress2
           ,@MCity
           ,@MState
           ,@MZipCode
           ,@OnSitePhoneNumber
           ,@ParkingFacility
           ,@HasHandicapSpaces
           ,@CancelDate
           ,@CancelReason
           ,@AlternativeEventPayment
           ,@IsReady
           ,@Comments
           ,@PollWorkerComments
           ,@UserID
           ,getdate()
		   ,@Latitude
		   ,@Longitude
		   ,@RequirementsReviewed
		   ,@SchoolBuildingID
		   ,@BuildingOwnerID
		   ,@TaxAbatement
		   ,@HasTaxAbatement
		   ,@OwnershipType
		   ,@RampInstallZone
		   ,@BuildingID)

	If @@Identity > 0
	Begin
		COMMIT TRAN
		SET @ID=@@Identity
	End
	Else
	Begin
		--RAISERROR()
		ROLLBACK TRAN
		SET @ID=0
	End
End
Else
Begin
	BEGIN TRAN
	UPDATE [Facility]
	   SET [BuildingTypeID] = @BuildingTypeID
		  ,[FacilityStatusID] = @FacilityStatusID
		  ,[FacilityAccessibilityID] = @FacilityAccessibilityID
		  ,[CountyID] = @CountyID
		  ,[Tract] = @Tract
		  ,[Block] = @Block
		  ,[IsDOJApproved] = @IsDOJApproved
		  ,[IsPaid] = @IsPaid
		  ,[CSD] = @CSD
		  ,[PolicePrecinctID] = @PolicePrecinctID
		  ,[SiteNumber] = @SiteNumber
		  ,[FacilityName] = @FacilityName
		  ,[ClosestPhone] = @ClosestPhone
		  ,[HouseNumber] = @HouseNumber
		  ,[StreetName] = @StreetName
		  ,[City] = @City
		  ,[State] = @State
		  ,[ZipCode] = @ZipCode
		  ,[ZoneID] = @ZoneID
		  ,[MAddress1] = @MAddress1
		  ,[MAddress2] = @MAddress2
		  ,[MCity] = @MCity
		  ,[MState] = @MState
		  ,[MZipCode] = @MZipCode
		  ,[OnSitePhoneNumber] = @OnSitePhoneNumber
		  ,[ParkingFacility] = @ParkingFacility
		  ,[HasHandicapSpaces] = @HasHandicapSpaces
		  ,[CancelDate] = @CancelDate
		  ,[CancelReason] = @CancelReason
		  ,[AlternativeEventPayment] = @AlternativeEventPayment
		  ,[IsReady] = @IsReady
		  ,[Comments] = @Comments
		  ,[PollWorkerComments] = @PollWorkerComments
		  ,[ModifiedBy] = @UserID
		  ,[Modified] = getdate()
		  ,[Latitude] = @Latitude
		  ,[Longitude] = @Longitude
		  ,[RequirementsReviewed]=@RequirementsReviewed
		  ,[SchoolBuildingID]=@SchoolBuildingID
		  ,[BuildingOwnerID]=@BuildingOwnerID
		  ,[TaxAbatement]=@TaxAbatement
		  ,[HasTaxAbatement]=@HasTaxAbatement
		  ,[OwnershipType]=@OwnershipType
		  ,[RampInstallZone]=@RampInstallZone
		  ,[BuildingID]=@BuildingID
	 WHERE [ID]=@ID

	If @@Rowcount=1
	Begin
		COMMIT TRAN
	End
	Else
	Begin
		ROLLBACK TRAN
		--RAISERR()
	End
End
GO

/****** Object:  StoredProcedure [dbo].[spLogActivity]    Script Date: 5/29/2025 6:51:46 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[spLogActivity]
	@UserID int,
	@ModuleID int,
	@FunctionID int = null,
	@TableID int = null,
	@RecordID int = null,
	@TextRecordID varchar(10) = null,
	@ActivityTypeID int = null,
	@ActivityDescription varchar(255),
	@PreviousText varchar(4000)=null,
	@NewText varchar(4000)=null

AS

BEGIN TRAN

INSERT INTO [LOG_ActivityLog]
           ([LogDTTM]
           ,[UserID]
           ,[ModuleID]
           ,[FunctionID]
           ,[TableID]
           ,[RecordID]
           ,[TextRecordID]
           ,[ActivityTypeID]
           ,[ActivityDescription]
		   ,[PreviousText]
		   ,[NewText])
     VALUES
           (getdate()
           ,@UserID
           ,@ModuleID
           ,@FunctionID
           ,@TableID
           ,@RecordID
           ,@TextRecordID
           ,@ActivityTypeID
           ,@ActivityDescription
		   ,@PreviousText
		   ,@NewText)

If @@Identity > 0
Begin
	COMMIT TRAN
End
Else
Begin
	--RAISERROR()
	ROLLBACK TRAN
End
GO

/****** Object:  StoredProcedure [dbo].[spProcessBDEL]    Script Date: 5/29/2025 6:51:46 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[spProcessBDEL]
	@RequestID int,
	@EventID int,
	@MapID INT,
	@FacilityTypeID int,
	@UserID int
AS

BEGIN TRAN

DECLARE @FromFacilityID int,
	@ToFacilityID int,
	@FromFacilityRoomID INT,
	@ToFacilityRoomID INT,
	@BDELReasonID INT

SELECT
	@FromFacilityID=FromFacilityID,
	@FromFacilityRoomID=FromFacilityRoomID,
	@ToFacilityID=ToFacilityID,
	@ToFacilityRoomID=ToFacilityRoomID,
	@BDELReasonID=BDELReasonID
FROM
	BDELRequest
WHERE
	ID=@RequestID

UPDATE BDELRequest
SET StatusCode='A',
	AdminDecisionID=(SELECT UserName FROM [User] WHERE ID=@UserID),
	AdminDecisionCode='A',
	AdminDecisionDate=getdate()
WHERE ID=@RequestID

If @@ROWCOUNT=1
Begin
	--Remove EDs from Old Facility
	DELETE FROM FacilityEDAD
	WHERE ID IN (	SELECT
						FE.ID
					FROM
						FacilityEDAD FE INNER JOIN BDELRequestItem BRI ON
						BRI.BDELRequestID=@RequestID
					AND	FE.EDID=BRI.EDID
					AND FE.FacilityID=@FromFacilityID
					AND FE.MapID=@MapID
					AND FE.FacilityTypeID=@FacilityTypeID)

	--Add EDs to New Facility
	INSERT INTO FacilityEDAD
		(MapID,FacilityID,FacilityTypeID,EDID,DistrictKey,CountyID,CreatedBy,Created,FacilityRoomID)
	SELECT
		@MapID,
		@ToFacilityID,
		@FacilityTypeID,
		EDID,
		(SELECT DistrictKey FROM PoliticalDistrict WHERE ID=EDID),
		(SELECT CountyID FROM BDELRequest WHERE ID=@RequestID),
		@UserID,
		getdate(),
		@ToFacilityRoomID
	FROM
		BDELRequestItem
	WHERE BDELRequestID=@RequestID

	--Log Activity
	INSERT INTO [ActivityAudit]
           ([ModuleID]
           ,[RecordID]
           ,[ActivityDate]
           ,[ActivityDescription]
           ,[UserID])
	SELECT
		3,
		EDID,
		GETDATE(),
		'ED Moved from ' +
		ISNULL((SELECT SiteNumber FROM Facility WHERE ID=@FromFacilityID),'Unassigned') +
		' to ' +
		ISNULL((SELECT SiteNumber FROM Facility WHERE ID=@ToFacilityID),'Unassigned'),
		@UserID
	FROM
		BDELRequestItem
	WHERE BDELRequestID=@RequestID

	--Update EventEDAD Table
	UPDATE EventEDAD
	SET FacilityID=@ToFacilityID,
		FacilityRoomID=@ToFacilityRoomID
	WHERE EventID=@EventID
	AND EDID IN (	SELECT
						EDID
					FROM
						BDELRequestItem
					WHERE BDELRequestID=@RequestID)
	AND FacilityID=@FromFacilityID

	--Update Poll Worker Designations
	UPDATE PollWorkerDesignation
	SET FacilityID=@ToFacilityID,
		FacilityRoomID=@ToFacilityRoomID
	FROM
		PollWorkerDesignation PWD INNER JOIN WorkType WT ON
		PWD.WorkTypeID=WT.ID
	AND WT.IsMain=1 INNER JOIN EventEDAD EE ON
		EE.EventID=@EventID
	AND EE.EDID=PWD.EDID
	AND PWD.EDID IN (	SELECT
						EDID
					FROM
						BDELRequestItem
					WHERE BDELRequestID=@RequestID)
	AND PWD.FacilityID=@FromFacilityID
	AND EE.FacilityID=@ToFacilityID

	COMMIT TRAN
End
Else
Begin
	ROLLBACK TRAN
	RAISERROR ('Error Processing BDEL Request',16,1)
End
GO

-- VIEWS --

/****** Object:  View [dbo].[vFacility]    Script Date: 5/29/2025 6:51:44 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [dbo].[vFacility]
AS
SELECT     
	F.ID,
	BT.[Description] AS BuildingType, 
	FS.[Description] AS FacilityStatus, 
	FA.[Description] AS FacilityAccessibility, 
	F.CountyID, 
	C.[Description] AS County, 
	F.Tract, 
    F.Block, 
    F.IsDOJApproved, 
    F.IsPaid, 
    ED.[Description] AS PollSiteEDADLocation, 
    F.CSD, 
    PP.[Description] AS Precinct, 
    F.SiteNumber, 
    F.FacilityName, 
    F.ClosestPhone, 
    F.HouseNumber, 
    F.StreetName, 
    F.City, 
    F.State, 
    F.ZipCode, 
    F.ZoneID, 
    F.MAddress1, 
    F.MAddress2, 
    F.MCity, 
    F.MState, 
    F.MZipCode, 
    F.OnSitePhoneNumber, 
    F.ParkingFacility, 
    F.HasHandicapSpaces, 
    F.CancelDate, 
    F.CancelReason, 
    F.AlternativeEventPayment, 
    F.IsReady, 
    F.Comments, 
    F.PollWorkerComments, 
    F.Latitude, 
    F.Longitude, 
    F.RequirementsReviewed
FROM         
	dbo.Facility F INNER JOIN dbo.BuildingType BT ON
	F.BuildingTypeID=BT.ID INNER JOIN dbo.FacilityStatus FS ON
	F.FacilityStatusID=FS.ID INNER JOIN dbo.FacilityAccessibility FA ON
	F.FacilityAccessibilityID=FA.ID INNER JOIN dbo.PoliticalDistrict C ON
	F.CountyID=C.ID INNER JOIN dbo.PolicePrecinct PP ON
	F.PolicePrecinctID=PP.ID INNER JOIN dbo.MapFacilityEDAD MFE ON
	F.ID=MFE.FacilityID INNER JOIN Map M ON
	MFE.MapID=M.ID
AND	M.IsCurrent=1 INNER JOIN dbo.PoliticalDistrict ED ON
	MFE.EDID=ED.ID

GO

/****** Object:  View [dbo].[vPollSite]    Script Date: 5/29/2025 6:51:44 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [dbo].[vPollSite]

AS

SELECT 
	F.ID ,
    F.BuildingTypeID ,
    F.FacilityStatusID ,
    F.FacilityAccessibilityID ,
    F.CountyID ,
    F.Tract ,
    F.Block ,
    F.IsDOJApproved ,
    F.IsPaid ,
    F.CSD ,
    F.PolicePrecinctID ,
    F.SiteNumber ,
    F.FacilityName ,
    F.ClosestPhone ,
    F.HouseNumber ,
    F.StreetName ,
    F.City ,
    F.State ,
    F.ZipCode ,
    F.ZoneID ,
    F.MAddress1 ,
    F.MAddress2 ,
    F.MCity ,
    F.MState ,
    F.MZipCode ,
    F.OnSitePhoneNumber ,
    F.ParkingFacility ,
    F.HasHandicapSpaces ,
    F.CancelDate ,
    F.CancelReason ,
    F.AlternativeEventPayment ,
    F.IsReady ,
    F.Comments ,
    F.PollWorkerComments ,
    F.CreatedBy ,
    F.Created ,
    F.ModifiedBy ,
    F.Modified ,
    F.Latitude ,
    F.Longitude ,
    F.RequirementsReviewed ,
    F.SchoolBuildingID ,
    F.BuildingOwnerID ,
    F.TaxAbatement ,
    F.HasTaxAbatement ,
    F.OwnershipType ,
    F.RampInstallZone ,
    F.BuildingID
FROM 
	dbo.Facility AS F INNER JOIN (

		SELECT
			FE.FacilityID
		FROM
			dbo.FacilityEDAD AS FE
		WHERE
			FE.FacilityTypeID=1
		AND FE.MapID=(SELECT ID FROM Map WHERE IsCurrent=1)
		GROUP BY
			FE.FacilityID

	) AS E ON
	F.ID=E.FacilityID
WHERE
	F.FacilityStatusID=1;


GO

/****** Object:  View [dbo].[vrptedwActivityLog]    Script Date: 5/29/2025 6:51:44 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE VIEW [dbo].[vrptedwActivityLog]

AS

SELECT
	C.Abbreviation AS County, 
	U.UserName AS RejectedByUser,
	AL.ID ,
	AL.edwUserId ,
	AL.ActivityType ,
	AL.ActivityDTTM ,
	AL.UserID ,
	AL.PreviousText ,
	AL.NewText ,
	AL.edwAppId ,
	AL.CountyID ,
	AL.appliedDTTM ,
	AL.FirstName ,
	AL.LastName ,
	AL.MiddleName ,
	AL.Suffix ,
	AL.DOB ,
	AL.[Address] ,
	AL.Email,
	COALESCE(AL.PreviousText,'') +
	COALESCE(' --> ' + AL.NewText,'') AS Detail,
	AL.AppSource,
	U.UserName
FROM
	dbo.edwActivityLog AS AL INNER JOIN dbo.PoliticalDistrict AS C ON
	AL.CountyID=C.ID INNER JOIN [dbo].[User] AS U ON
	AL.UserID=U.ID


GO


-- USER-DEFINED FUNCTIONS --

/****** Object:  UserDefinedFunction [dbo].[udfGetFacilityAddress]    Script Date: 5/29/2025 6:51:44 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[udfGetFacilityAddress](@ID as int)

RETURNS varchar(255)

AS

BEGIN

DECLARE
	@Address as varchar(255)

SELECT
	@Address = RTRIM(F.HouseNumber + ' ' + F.StreetName) + ', ' +
	F.City + ', ' + F.State + '  ' + F.ZipCode
FROM
	Facility F
WHERE
	F.ID=@ID

RETURN @Address

END
GO

/****** Object:  UserDefinedFunction [dbo].[udfGetFacilityName]    Script Date: 5/29/2025 6:51:44 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[udfGetFacilityName](@ID as int)

RETURNS varchar(60)

AS

BEGIN

DECLARE
	@Name as varchar(60)

SELECT
	@Name = F.FacilityName
FROM
	Facility F
WHERE
	F.ID=@ID

RETURN @Name

END
GO

/****** Object:  UserDefinedFunction [dbo].[udfGetPollSiteName]    Script Date: 5/29/2025 6:51:44 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[udfGetPollSiteName](@ID as int)

RETURNS varchar(70)

AS

BEGIN

DECLARE
	@Name as varchar(70)

SELECT
	@Name = F.SiteNumber + '-' + F.FacilityName
FROM
	Facility F
WHERE
	F.ID=@ID

RETURN @Name

END
GO

/****** Object:  UserDefinedFunction [dbo].[CHANGE_CASE]    Script Date: 5/29/2025 6:51:43 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
create                function [dbo].[CHANGE_CASE]
(
	@InString as varchar(8000)
)

returns varchar(8000)
as
begin

declare @ReturnString as varchar(8000),
	@LastIsSpace as bit,
	@IsSpace as bit,
	@CurrentByte as varchar(1),
	@Index as int
	
set @Index = 0
set @IsSpace=0
set @ReturnString=''

while (@Index < len(@InString))
  begin
	set @Index = @Index + 1	
	
	set @CurrentByte = substring(@Instring,@Index,1)
	
	if (@Index=1 or @IsSpace=1) and @CurrentByte <> ' '
	    set @ReturnString=@ReturnString + upper(@CurrentByte)

	if (@IsSpace=0 and @Index > 1)
	    set @ReturnString=@ReturnString + lower(@CurrentByte)


	if @CurrentByte = ' '
	   set @IsSpace =1
	else
	   set @IsSpace =0
		
	

  end

return rtrim(@ReturnString)

end
GO

-- TRIGGERS --

/****** Object:  Trigger [dbo].[TRG_LOG_ActivityLog_I]    Script Date: 5/29/2025 6:51:46 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TRIGGER [dbo].[TRG_LOG_ActivityLog_I] ON [dbo].[LOG_ActivityLog]
FOR INSERT
AS

UPDATE [LOG_ActivityLog]
SET [LogDTTM]=GETDATE()
WHERE ID IN (SELECT ID FROM INSERTED)
GO
ALTER TABLE [dbo].[LOG_ActivityLog] ENABLE TRIGGER [TRG_LOG_ActivityLog_I]
GO


-- EXTENDED PROPERTIES (Examples) --

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Primary key for Facility records' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'FAC_Facility', @level2type=N'COLUMN',@level2name=N'ID'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Stores information about physical locations such as poll sites, warehouses, or offices.' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'FAC_Facility'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Logs various activities within the system for auditing purposes.' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'LOG_ActivityLog'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Processes Board of Elections Delivery/Logistics requests, potentially involving inventory movement.' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'PROCEDURE',@level1name=N'spProcessBDEL'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Provides a view of facility details.' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'vFacility'
GO